import React from 'react'
import {useTranslation} from 'react-i18next'
import {Icon, IconButton, Input, InputGroup, Toggle} from 'rsuite'
import {ContentEditActionEnum} from '../../control/contentReducer'
import {ContentModelSchemaFieldString} from '../../interfaces/contentModelSchema'
import {isNullOrUndefined} from '../../utility'
import {BlockAbstractProps} from './BlockAbstract'

function BlockString({
  dispatch,
  schemaPath,
  model,
  value,
  disabled
}: BlockAbstractProps<ContentModelSchemaFieldString, string | null>) {
  let toggle
  const isActive = !isNullOrUndefined(value)
  const {t} = useTranslation()

  let button = null
  if (model.editor?.inputType === 'url' && value) {
    button = (
      <IconButton
        icon={<Icon icon="external-link" />}
        onClick={() => {
          window.open(value, '_blank')
        }}
      />
    )
  }

  if (model.optional) {
    toggle = (
      <>
        <Toggle
          size="sm"
          style={{
            marginTop: 4,
            marginBottom: 4,
            fontSize: 15,
            visibility: disabled ? 'hidden' : 'inherit'
          }}
          checkedChildren={t('global.buttons.enabled')}
          unCheckedChildren={t('global.buttons.disabled')}
          checked={isActive}
          onChange={() => {
            if (isActive) {
              dispatch({type: ContentEditActionEnum.update, value: null, path: schemaPath})
            } else {
              dispatch({type: ContentEditActionEnum.update, value: '', path: schemaPath})
            }
          }}
        />
      </>
    )
  }

  return (
    <div style={{width: '100%', margin: 0}}>
      {toggle}
      <InputGroup>
        <Input
          style={{width: '100%'}}
          componentClass={model.editor?.inputType === 'textarea' ? 'textarea' : undefined}
          readOnly={!isActive && model.optional}
          disabled={disabled}
          type={model.editor?.inputType || 'text'}
          rows={model.editor?.inputRows}
          maxLength={model.editor?.maxCharacters}
          placeholder={model.editor?.placeholder}
          value={value || ''}
          onChange={val =>
            dispatch({type: ContentEditActionEnum.update, value: val, path: schemaPath})
          }
        />
        {button}
      </InputGroup>
    </div>
  )
}

export default React.memo(BlockString)
