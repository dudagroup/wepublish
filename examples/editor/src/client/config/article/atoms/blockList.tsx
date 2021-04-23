import React, {Fragment, useState, ReactNode, useMemo, memo} from 'react'
import {ValueConstructor, UnionToIntersection} from '@karma.run/utility'

import {AddBlockInput} from './addBlockInput'
import {IconButton, Icon, Panel} from 'rsuite'
import {IconNames} from 'rsuite/lib/Icon/Icon'
import {SVGIcon} from 'rsuite/lib/@types/common'
import {
  ContentEditAction,
  ContentEditActionEnum
} from '@wepublish/editor/lib/client/control/contentReducer'
import {
  BlockValue,
  Configs,
  ContentModelConfigMerged,
  generateEmptyContent
} from '@wepublish/editor'
import {BlockMap} from '../blocks/blockMap'
import {SchemaPath} from '@wepublish/editor/lib/client/interfaces/utilTypes'
import nanoid from 'nanoid'
import {destructUnionCase} from '../utility'

export interface BlockProps<V = any> {
  value: V
  onChange: (value: any, path: SchemaPath) => void
  autofocus?: boolean
  disabled?: boolean
  configs: Configs
}

export type BlockConstructorFn<V = any> = (props: BlockProps<V>) => JSX.Element

export interface BlockCaseProps<V = any> {
  label: string
  icon: IconNames | SVGIcon
  defaultValue: ValueConstructor<V>
  field: BlockConstructorFn<V>
}

export interface BlockListValue<T extends string = string, V = any> {
  [unionCase: string]: V
}

export type BlockMap = Record<string, BlockCaseProps>

export type BlockMapForValue<R extends BlockListValue> = UnionToIntersection<
  R extends BlockListValue<infer T, infer V> ? {[K in T]: BlockCaseProps<V>} : never
>

export interface BlockListItemProps<T extends string = string, V = any> {
  index: number
  value: BlockListValue<T, V>
  icon: IconNames | SVGIcon
  autofocus: boolean
  disabled?: boolean
  dispatch: React.Dispatch<ContentEditAction>
  unionCase: string
  onDelete: (index: number) => void
  onMoveUp?: (index: number) => void
  onMoveDown?: (index: number) => void
  children: (props: BlockProps<V>) => JSX.Element
  configs: Configs
}

const BlockListItem = memo(function BlockListItem({
  index,
  value,
  icon,
  unionCase,
  dispatch,
  autofocus,
  disabled,
  children,
  onDelete,
  onMoveUp,
  onMoveDown,
  configs
}: BlockListItemProps) {
  return (
    <ListItemWrapper
      icon={icon}
      disabled={disabled}
      onDelete={() => onDelete(index)}
      onMoveUp={onMoveUp ? () => onMoveUp(index) : undefined}
      onMoveDown={onMoveDown ? () => onMoveDown(index) : undefined}>
      {children({
        value,
        configs,
        onChange: (value, path) => {
          dispatch({
            type: ContentEditActionEnum.update,
            path: ['blocks', index, unionCase].concat(path),
            value
          })
        },
        autofocus,
        disabled
      })}
    </ListItemWrapper>
  )
})

export function useBlockMap<V extends BlockListValue>(
  map: () => BlockMapForValue<V>,
  deps: ReadonlyArray<any> | undefined
) {
  return useMemo(map, deps)
}

export interface BlockListProps<V extends BlockListValue> {
  value: BlockListRoot<V>
  onChange: React.Dispatch<React.SetStateAction<BlockListRoot<V>>>
  autofocus?: boolean
  disabled?: boolean
  dispatch: React.Dispatch<ContentEditAction>
  configs: Configs
  contentModelConfigMerged: ContentModelConfigMerged
}

export interface BlockListRoot<V> {
  blocks: {[unionCase: string]: V}[]
}

export function BlockList<V extends BlockListValue>({
  value: values,
  disabled,
  dispatch,
  configs,
  contentModelConfigMerged
}: BlockListProps<V>) {
  const [focusIndex, setFocusIndex] = useState<number | null>(null)

  const blockMap = useBlockMap<BlockValue>(() => BlockMap, []) as BlockMap

  const handleRemove = (itemIndex: number) => {
    dispatch({
      type: ContentEditActionEnum.splice,
      path: ['blocks'],
      start: itemIndex,
      delete: 1,
      insert: []
    })
  }

  const handleMoveUp = (index: number) => {
    dispatch({
      type: ContentEditActionEnum.splice,
      path: ['blocks'],
      start: index - 1,
      delete: 2,
      insert: [values.blocks[index], values.blocks[index - 1]]
    })
  }

  const handleMoveDown = (index: number) => {
    dispatch({
      type: ContentEditActionEnum.splice,
      path: ['blocks'],
      start: index,
      delete: 2,
      insert: [values.blocks[index + 1], values.blocks[index]]
    })
  }

  function addButtonForIndex(index: number) {
    return (
      <div
        style={{
          paddingLeft: 30,
          paddingRight: 30,
          marginTop: 10,
          marginBottom: 10,
          textAlign: 'center'
        }}>
        <AddBlockInput
          menuItems={Object.entries(blockMap).map(([type, {icon, label}]) => ({
            id: type,
            icon,
            label
          }))}
          onMenuItemClick={({id}: {id: string}) => {
            dispatch({
              type: ContentEditActionEnum.splice,
              path: ['blocks'],
              start: index,
              delete: 0,
              insert: [
                {
                  [id]: generateEmptyContent(
                    contentModelConfigMerged.schema.content.blocks.contentType.cases[id],
                    configs.apiConfig.languages
                  )
                }
              ]
            })
            setFocusIndex(index)
          }}
          subtle={index !== values.blocks.length || disabled}
          disabled={disabled}
        />
      </div>
    )
  }

  function listItemForIndex(value: V, index: number) {
    const hasPrevIndex = index - 1 >= 0
    const hasNextIndex = index + 1 < values.blocks.length
    const {unionCase, value: val} = destructUnionCase(value)
    const blockDef = blockMap[unionCase]
    if (!val.__ephemeralReactStateMeta) {
      val.__ephemeralReactStateMeta = {
        id: nanoid() + 'a'
      }
    }

    return (
      <Fragment key={val.__ephemeralReactStateMeta.id}>
        <BlockListItem
          configs={configs}
          index={index}
          value={val}
          unionCase={unionCase}
          icon={blockDef.icon}
          onDelete={handleRemove}
          dispatch={dispatch}
          onMoveUp={hasPrevIndex ? handleMoveUp : undefined}
          onMoveDown={hasNextIndex ? handleMoveDown : undefined}
          autofocus={focusIndex === index}
          disabled={disabled}>
          {blockDef.field}
        </BlockListItem>
        {addButtonForIndex(index + 1)}
      </Fragment>
    )
  }

  return (
    <div
      style={{
        width: '100%'
      }}>
      {addButtonForIndex(0)}
      {values.blocks.map((value: any, index: any) => listItemForIndex(value, index))}
    </div>
  )
}

interface ListItemWrapperProps {
  children?: ReactNode
  icon?: IconNames | SVGIcon
  disabled?: boolean

  onDelete?: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
}

function ListItemWrapper({
  children,
  icon,
  disabled,
  onDelete,
  onMoveUp,
  onMoveDown
}: ListItemWrapperProps) {
  return (
    <div
      style={{
        display: 'flex',
        width: '100%'
      }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginRight: 10
        }}>
        <IconButton
          icon={<Icon icon="trash" />}
          onClick={onDelete}
          disabled={onDelete == null || disabled}
        />
        <div style={{flexGrow: 1}} />
        <div style={{marginTop: 10, marginBottom: 5}}>
          <IconButton
            icon={<Icon icon="arrow-up" />}
            onClick={onMoveUp}
            disabled={onMoveUp == null || disabled}
          />
        </div>
        <div style={{marginBottom: 10}}>
          <IconButton
            title=""
            icon={<Icon icon="arrow-down" />}
            onClick={onMoveDown}
            disabled={onMoveDown == null || disabled}
          />
        </div>
        <div style={{flexGrow: 1}} />
      </div>
      <div
        style={{
          display: 'flex',
          width: '100%'
        }}>
        <Panel style={{width: '100%'}} bordered={true}>
          <div style={{padding: 20}}>{children}</div>
        </Panel>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginLeft: 10,
          fontSize: 24,
          fill: 'gray'
        }}>
        {icon && <Icon icon={icon} />}
      </div>
    </div>
  )
}
