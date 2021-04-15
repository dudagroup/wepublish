import {isFunctionalUpdate} from '@karma.run/react'
import React from 'react'
import {Panel, Toggle} from 'rsuite'
import {ContentContextEnum} from '../../api'
import {RichTextBlock} from '../../blocks/richTextBlock/richTextBlock'
import {ContentModelSchemaFieldString} from '../../interfaces/contentModelSchema'
import {SchemaPath} from '../../interfaces/utilTypes'
import {ContentEditAction, ContentEditActionEnum} from '../../routes/contentEditor'
import {isNullOrUndefined} from '../../utility'

interface BlockRichTextProps {
  readonly schemaPath: SchemaPath
  readonly dispatch: React.Dispatch<ContentEditAction>
  readonly value: any
  readonly model: ContentModelSchemaFieldString
}

function BlockRichText({dispatch, schemaPath, model, value}: BlockRichTextProps) {
  const empty = [
    {
      type: 'paragraph',
      children: [
        {
          text: ''
        }
      ]
    }
  ]
  const v = value || empty

  const isActive = !isNullOrUndefined(value)
  let toggle
  if (!model.required) {
    toggle = (
      <>
        <Toggle
          size="sm"
          checked={isActive}
          onChange={() => {
            if (isActive) {
              dispatch({type: ContentEditActionEnum.update, value: null, schemaPath})
            } else {
              dispatch({type: ContentEditActionEnum.update, value: empty, schemaPath})
            }
          }}
        />
        <br />
        <br />
      </>
    )
  }

  return (
    <Panel bordered>
      {toggle}
      <RichTextBlock
        value={v}
        disabled={isNullOrUndefined(value)}
        onChange={richText => {
          const update = isFunctionalUpdate(richText) ? richText(v) : richText
          dispatch({
            type: ContentEditActionEnum.update,
            value: update,
            schemaPath
          })
        }}
        config={{
          ref: {
            modelA: {scope: ContentContextEnum.Local}
          }
        }}
      />
    </Panel>
  )
}

export default React.memo(BlockRichText)
