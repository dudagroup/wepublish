import React from 'react'
import {CheckPicker} from 'rsuite'
import {BlockAbstractProps} from './BlockAbstract'
import {ContentModelSchemaFieldEnum} from '@dudagroup/api'
import {ContentEditActionEnum} from '../../control/contentReducer'
import {Reference} from '../../interfaces/referenceType'
import {genericBlockMinWidth} from './BlockStyle'

export function BlockPicker({
  dispatch,
  model,
  value,
  schemaPath
}: BlockAbstractProps<ContentModelSchemaFieldEnum, Reference[]>) {
  function handleChange(value: string[]) {
    dispatch({
      type: ContentEditActionEnum.update,
      path: schemaPath,
      value: value
    })
  }

  return (
    <CheckPicker
      data={model.values}
      value={value}
      labelKey="description"
      valueKey="value"
      onChange={handleChange}
      style={{minWidth: genericBlockMinWidth, paddingBottom: 2}}
    />
  )
}

export default BlockPicker
