import React from 'react'
import {FormControl, Toggle} from 'rsuite'
import {ContentModelSchemaFieldString} from '../../interfaces/contentModelSchema'
import {SchemaPath} from '../../interfaces/utilTypes'
import {ContentEditAction, ContentEditActionEnum} from '../../routes/contentEditor'
import {isNullOrUndefined} from '../../utility'

interface BlockStringProps {
  readonly schemaPath: SchemaPath
  readonly dispatch: React.Dispatch<ContentEditAction>
  readonly value: any
  readonly model: ContentModelSchemaFieldString
}

function BlockString({dispatch, schemaPath, model, value}: BlockStringProps) {
  let toggle
  const isActive = !isNullOrUndefined(value)
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
              dispatch({type: ContentEditActionEnum.update, value: '', schemaPath})
            }
          }}
        />
        <br />
        <br />
      </>
    )
  }
  return (
    <>
      {toggle}
      <FormControl
        componentClass="textarea"
        readOnly={!isActive}
        rows={3}
        value={value || ''}
        onChange={val => dispatch({type: ContentEditActionEnum.update, value: val, schemaPath})}
      />
    </>
  )
}

export default React.memo(BlockString)
