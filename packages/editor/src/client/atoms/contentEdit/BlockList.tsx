import React from 'react'
import {ContentModelSchemaFieldList} from '../../interfaces/contentModelSchema'
import {Icon, IconButton, List} from 'rsuite'
import BlockAbstract, {BlockAbstractProps} from './BlockAbstract'
import {generateEmptyContent} from '../../routes/contentEditor'
import {ContentEditActionEnum} from '../../control/contentReducer'

export function BlockList({
  dispatch,
  model,
  languageContext,
  value,
  schemaPath
}: BlockAbstractProps<ContentModelSchemaFieldList, unknown[]>) {
  const childSchemaPath = [...schemaPath]

  const content = value.map((item, index, array) => {
    let buttonUp = null
    if (index !== 0) {
      buttonUp = (
        <IconButton
          icon={<Icon icon="up" />}
          onClick={() => {
            dispatch({
              type: ContentEditActionEnum.splice,
              schemaPath: childSchemaPath,
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
          onClick={() => {
            dispatch({
              type: ContentEditActionEnum.splice,
              schemaPath: childSchemaPath,
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
        <IconButton
          icon={<Icon icon="plus" />}
          onClick={() => {
            dispatch({
              type: ContentEditActionEnum.splice,
              schemaPath: childSchemaPath,
              start: index + 1,
              delete: 0,
              insert: [generateEmptyContent(model.contentType, languageContext.languagesConfig)]
            })
          }}
        />

        <IconButton
          icon={<Icon icon="minus" />}
          onClick={() => {
            dispatch({
              type: ContentEditActionEnum.splice,
              schemaPath: childSchemaPath,
              start: index,
              delete: 1,
              insert: []
            })
          }}
        />

        {buttonUp}
        {buttonDown}

        <BlockAbstract
          schemaPath={[...childSchemaPath, index]}
          dispatch={dispatch}
          model={model.contentType}
          languageContext={languageContext}
          value={item}></BlockAbstract>
      </List.Item>
    )
  })

  return (
    <>
      <List>{content}</List>
      <IconButton
        icon={<Icon icon="plus" />}
        onClick={() => {
          dispatch({
            type: ContentEditActionEnum.push,
            schemaPath: childSchemaPath,
            insert: [generateEmptyContent(model.contentType, languageContext.languagesConfig)]
          })
        }}
      />
    </>
  )
}

export default BlockList
