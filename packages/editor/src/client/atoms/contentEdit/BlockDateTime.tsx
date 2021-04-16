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
  value
}: BlockAbstractProps<ContentModelSchemaFieldString, string | null>) {
  const isActive = !isNullOrUndefined(value)
  return (
    <>
      <DatePicker
        value={isActive ? new Date(value!) : undefined}
        cleanable={model.optional}
        onChange={val => {
          dispatch({
            type: ContentEditActionEnum.update,
            value: val ? val.toISOString() : null,
            schemaPath
          })
        }}
      />
    </>
  )
}

export default React.memo(BlockDateTime)
