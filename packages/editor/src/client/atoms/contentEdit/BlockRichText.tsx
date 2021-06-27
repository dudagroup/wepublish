import {isFunctionalUpdate} from '@karma.run/react'
import React from 'react'
import {Panel, Toggle} from 'rsuite'
import {RichTextBlock} from '../../blocks/richTextBlock/richTextBlock'
import {RichTextBlockValue} from '../../blocks/types'
import {ContentEditActionEnum} from '../../control/contentReducer'
import {ContentModelSchemaFieldRichText} from '../../interfaces/contentModelSchema'
import {isNullOrUndefined} from '../../utility'
import {BlockAbstractProps} from './BlockAbstract'

function BlockRichText({
  dispatch,
  schemaPath,
  model,
  value,
  disabled
}: BlockAbstractProps<ContentModelSchemaFieldRichText, RichTextBlockValue>) {
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
  if (model.optional) {
    toggle = (
      <>
        <Toggle
          size="sm"
          checked={isActive}
          onChange={() => {
            if (isActive) {
              dispatch({type: ContentEditActionEnum.update, value: null, path: schemaPath})
            } else {
              dispatch({type: ContentEditActionEnum.update, value: empty, path: schemaPath})
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
        displayOnly={disabled}
        disabled={(!isActive && model.optional) || disabled}
        onChange={richText => {
          const update = isFunctionalUpdate(richText) ? richText(v) : richText
          dispatch({
            type: ContentEditActionEnum.update,
            value: update,
            path: schemaPath
          })
        }}
        config={model.config}
      />
    </Panel>
  )
}

export default React.memo(BlockRichText)
