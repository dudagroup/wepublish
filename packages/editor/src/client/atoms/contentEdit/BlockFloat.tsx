import React from 'react'
import {InputNumber} from 'rsuite'
import {ContentModelSchemaFieldFloat} from '../../interfaces/contentModelSchema'
import {SchemaPath} from '../../interfaces/utilTypes'
import {ContentEditAction, ContentEditActionEnum} from '../../routes/contentEditor'
import {isNullOrUndefined} from '../../utility'

interface BlockFloatProps {
  readonly schemaPath: SchemaPath
  readonly dispatch: React.Dispatch<ContentEditAction>
  readonly value: number
  readonly model: ContentModelSchemaFieldFloat
}
function BlockFloat({value, schemaPath, dispatch}: BlockFloatProps) {
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
