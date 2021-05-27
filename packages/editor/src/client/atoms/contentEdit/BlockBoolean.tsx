import React, {memo} from 'react'
import {Toggle} from 'rsuite'
import {ContentEditActionEnum} from '../../control/contentReducer'
import {ContentModelSchemaFieldBoolean} from '../../interfaces/contentModelSchema'
import {BlockAbstractProps} from './BlockAbstract'

function BlockBoolean({
  value,
  schemaPath,
  dispatch,
  disabled
}: BlockAbstractProps<ContentModelSchemaFieldBoolean, boolean>) {
  return (
    <Toggle
      checked={value}
      disabled={disabled}
      onChange={val =>
        dispatch({type: ContentEditActionEnum.update, value: Boolean(val), path: schemaPath})
      }
    />
  )
}

export default memo(BlockBoolean)
