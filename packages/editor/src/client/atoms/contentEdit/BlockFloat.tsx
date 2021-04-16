import React from 'react'
import {InputNumber} from 'rsuite'
import {ContentEditActionEnum} from '../../control/contentReducer'
import {ContentModelSchemaFieldFloat} from '../../interfaces/contentModelSchema'
import {isNullOrUndefined} from '../../utility'
import {BlockAbstractProps} from './BlockAbstract'

function BlockFloat({
  value,
  schemaPath,
  dispatch
}: BlockAbstractProps<ContentModelSchemaFieldFloat, number>) {
  return (
    <InputNumber
      value={value}
      disabled={isNullOrUndefined(value)}
      step={0.001}
      onChange={val =>
        dispatch({type: ContentEditActionEnum.update, value: Number(val), schemaPath})
      }
    />
  )
}

export default BlockFloat
