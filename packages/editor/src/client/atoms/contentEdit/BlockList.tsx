import React from 'react'
import {
  ContentModelSchemaFieldList,
  ContentModelSchemaTypes
} from '../../interfaces/contentModelSchema'
import {FlexboxGrid, Icon, IconButton, List} from 'rsuite'
import BlockAbstract, {BlockAbstractProps} from './BlockAbstract'
import {ContentEditActionEnum} from '../../control/contentReducer'
import {generateEmptyContent} from '../../control/contentUtil'
import BlockTags from './BlockTags'
import {useTranslation} from 'react-i18next'
import {Reference} from '../../interfaces/referenceType'

export function BlockList(props: BlockAbstractProps<ContentModelSchemaFieldList, unknown[]>) {
  if (
    props.model.contentType.type === ContentModelSchemaTypes.reference &&
    Object.keys(props.model.contentType.types).length === 1 &&
    props.model.editor?.presentReferenceListAsTagPicker
  ) {
    return (
      <BlockTags
        configs={props.configs}
        dispatch={props.dispatch}
        schemaPath={props.schemaPath}
        value={props.value as Reference[]}
        languageContext={props.languageContext}
        model={props.model.contentType}
      />
    )
  }

  const {dispatch, model, languageContext, value, schemaPath} = props
  const childSchemaPath = [...schemaPath]
  const {t} = useTranslation()
  const content = value.map((item, index, array) => {
    let buttonUp = null
    if (index !== 0) {
      buttonUp = (
        <IconButton
          icon={<Icon icon="up" />}
          appearance="subtle"
          size="xs"
          onClick={() => {
            dispatch({
              type: ContentEditActionEnum.splice,
              path: childSchemaPath,
              start: index - 1,
              delete: 2,
              insert: [item, array[index - 1]]
            })
          }}
        />
      )
    }
    let buttonDown = null
    if (index !== array.length - 1) {
      buttonDown = (
        <IconButton
          icon={<Icon icon="down" />}
          appearance="subtle"
          size="xs"
          onClick={() => {
            dispatch({
              type: ContentEditActionEnum.splice,
              path: childSchemaPath,
              start: index,
              delete: 2,
              insert: [array[index + 1], item]
            })
          }}
        />
      )
    }

    return (
      <List.Item key={index} index={index}>
        <FlexboxGrid align="middle">
          <FlexboxGrid.Item colspan={1}>
            {buttonUp}
            {buttonDown}
          </FlexboxGrid.Item>
          <FlexboxGrid.Item colspan={22}>
            <BlockAbstract
              configs={props.configs}
              schemaPath={[...childSchemaPath, index]}
              dispatch={dispatch}
              model={model.contentType}
              languageContext={languageContext}
              value={item}></BlockAbstract>
          </FlexboxGrid.Item>
          <FlexboxGrid.Item colspan={1} style={{textAlign: 'right'}}>
            {/* <IconButton
              icon={<Icon icon="plus" />}
              size="xs"
              appearance="subtle"
              onClick={() => {
                dispatch({
                  type: ContentEditActionEnum.splice,
                  path: childSchemaPath,
                  start: index + 1,
                  delete: 0,
                  insert: [generateEmptyContent(model.contentType, languageContext.languagesConfig)]
                })
              }}
            /> */}

            <IconButton
              icon={<Icon icon="minus-square" />}
              size="md"
              appearance="subtle"
              color="red"
              onClick={() => {
                dispatch({
                  type: ContentEditActionEnum.splice,
                  path: childSchemaPath,
                  start: index,
                  delete: 1,
                  insert: []
                })
              }}
            />
          </FlexboxGrid.Item>
        </FlexboxGrid>
      </List.Item>
    )
  })

  return (
    <>
      <List>{content}</List>
      <IconButton
        appearance="ghost"
        icon={<Icon icon="plus" />}
        style={{marginTop: 5}}
        onClick={() => {
          dispatch({
            type: ContentEditActionEnum.push,
            path: childSchemaPath,
            insert: [generateEmptyContent(model.contentType, languageContext.languagesConfig)]
          })
        }}>
        {t('global.buttons.add')}
      </IconButton>
    </>
  )
}

export default BlockList
