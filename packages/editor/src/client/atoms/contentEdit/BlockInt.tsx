import React from 'react'
import {InputNumber} from 'rsuite'
import {ContentEditActionEnum} from '../../control/contentReducer'
import {ContentModelSchemaFieldInt} from '../../interfaces/contentModelSchema'
import {isNullOrUndefined} from '../../utility'
import {BlockAbstractProps} from './BlockAbstract'

function BlockInt({
  value,
  schemaPath,
  dispatch,
  disabled
}: BlockAbstractProps<ContentModelSchemaFieldInt, number>) {
  const Max32BitIntSize = Math.pow(2, 31) - 1
  return (
    <InputNumber
      value={value}
      disabled={isNullOrUndefined(value) || disabled}
      step={1}
      onChange={val =>
        dispatch({
          type: ContentEditActionEnum.update,
          value: Math.min(Math.max(Number(val), -Max32BitIntSize), Max32BitIntSize),
          path: schemaPath
        })
      }
    />
  )
}

export default BlockInt
