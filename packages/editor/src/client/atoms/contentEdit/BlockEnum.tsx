import React from 'react'
import {SelectPicker} from 'rsuite'
import {ContentEditActionEnum} from '../../control/contentReducer'
import {ContentModelSchemaFieldEnum} from '../../interfaces/contentModelSchema'
import {BlockAbstractProps} from './BlockAbstract'

function BlockEnum({
  value,
  dispatch,
  model,
  schemaPath
}: BlockAbstractProps<ContentModelSchemaFieldEnum, unknown>) {
  const data = model.values.map(val => {
    return {
      label: val.description,
      value: val.value
    }
  })

  return (
    <SelectPicker
      cleanable={!!model.optional}
      searchable={false}
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
