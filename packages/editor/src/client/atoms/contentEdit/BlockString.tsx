import React from 'react'
import {FormControl, Toggle} from 'rsuite'
import {ContentEditActionEnum} from '../../control/contentReducer'
import {ContentModelSchemaFieldString} from '../../interfaces/contentModelSchema'
import {isNullOrUndefined} from '../../utility'
import {BlockAbstractProps} from './BlockAbstract'

function BlockString({
  dispatch,
  schemaPath,
  model,
  value
}: BlockAbstractProps<ContentModelSchemaFieldString, string | null>) {
  let toggle
  const isActive = !isNullOrUndefined(value)
  if (model.optional) {
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
