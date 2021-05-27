import React from 'react'
import {SelectPicker} from 'rsuite'
import {ContentEditActionEnum} from '../../control/contentReducer'
import {ContentModelSchemaFieldEnum} from '../../interfaces/contentModelSchema'
import {BlockAbstractProps} from './BlockAbstract'
import {genericBlockMinWidth} from './BlockStyle'

function BlockEnum({
  value,
  dispatch,
  model,
  schemaPath,
  disabled
}: BlockAbstractProps<ContentModelSchemaFieldEnum, unknown>) {
  const data = model.values.map(val => {
    return {
      label: val.description,
      value: val.value
    }
  })

  return (
    <SelectPicker
      style={{minWidth: genericBlockMinWidth}}
      cleanable={!!model.optional}
      searchable={data.length > 5}
      disabled={disabled}
      data={data}
      value={value}
      onChange={val => {
        dispatch({
          type: ContentEditActionEnum.update,
          value: val,
          path: schemaPath
        })
      }}
    />
  )
}

export default React.memo(BlockEnum)
