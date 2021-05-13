import React from 'react'
import {useTranslation} from 'react-i18next'
import {Form, FormControl, Icon, IconButton, InputGroup, Toggle, Tooltip, Whisper} from 'rsuite'
import {ContentEditActionEnum} from '../../control/contentReducer'
import {ContentModelSchemaFieldString} from '../../interfaces/contentModelSchema'
import {isNullOrUndefined, slugify} from '../../utility'
import {BlockAbstractProps} from './BlockAbstract'

function BlockString({
  dispatch,
  schemaPath,
  model,
  value
}: BlockAbstractProps<ContentModelSchemaFieldString, string | null>) {
  let toggle
  const isActive = !isNullOrUndefined(value)
  const {t} = useTranslation()

  if (model.optional) {
    toggle = (
      <>
        <Toggle
          size="sm"
          style={{marginTop: 4, marginBottom: 4, fontSize: 15}}
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

  if (model.editor?.inputType === 'slug') {
    return (
      <InputGroup style={{width: '100%'}}>
        <Form style={{width: '100%', margin: 0}}>
          <FormControl
            value={value || ''}
            onChange={val =>
              dispatch({type: ContentEditActionEnum.update, value: val, path: schemaPath})
            }
            onBlur={() =>
              dispatch({
                type: ContentEditActionEnum.update,
                value: slugify(value || ''),
                path: schemaPath
              })
            }
          />
        </Form>
        <Whisper
          placement="top"
          trigger="hover"
          speaker={<Tooltip>{t('articleEditor.panels.slugifySeoTitle')}</Tooltip>}>
          <IconButton
            icon={<Icon icon="magic" />}
            onClick={() => {
              // TODO derive from other configurable field
              dispatch({
                type: ContentEditActionEnum.update,
                value: slugify(value || ''),
                path: schemaPath
              })
            }}
          />
        </Whisper>
      </InputGroup>
    )
  }

  return (
    <Form style={{width: '100%', margin: 0}}>
      {toggle}
      <FormControl
        componentClass={model.editor?.inputType === 'textarea' ? 'textarea' : undefined}
        readOnly={!isActive}
        type={model.editor?.inputType || 'text'}
        rows={model.editor?.inputRows}
        maxLength={model.editor?.maxCharacters}
        placeholder={model.editor?.placeholder}
        value={value || ''}
        onChange={val =>
          dispatch({type: ContentEditActionEnum.update, value: val, path: schemaPath})
        }
      />
    </Form>
  )
}

export default React.memo(BlockString)
