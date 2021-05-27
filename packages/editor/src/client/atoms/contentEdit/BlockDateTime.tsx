import React from 'react'
import {DatePicker} from 'rsuite'
import {ContentEditActionEnum} from '../../control/contentReducer'
import {ContentModelSchemaFieldString} from '../../interfaces/contentModelSchema'
import {isNullOrUndefined} from '../../utility'
import {BlockAbstractProps} from './BlockAbstract'

function BlockDateTime({
  dispatch,
  schemaPath,
  model,
  value,
  disabled
}: BlockAbstractProps<ContentModelSchemaFieldString, string | null>) {
  const isActive = !isNullOrUndefined(value)
  return (
    <>
      <DatePicker
        style={{width: '100%'}}
        value={value && isActive ? new Date(value) : undefined}
        cleanable={model.optional}
        disabled={disabled}
        onChange={val => {
          dispatch({
            type: ContentEditActionEnum.update,
            value: val ? val.toISOString() : null,
            path: schemaPath
          })
        }}
      />
    </>
  )
}

export default React.memo(BlockDateTime)
