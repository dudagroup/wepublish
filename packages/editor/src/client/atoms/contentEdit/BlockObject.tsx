import React from 'react'
import {BlockAbstractProps} from './BlockAbstract'
import {ContentModelSchemaFieldObject} from '../../interfaces/contentModelSchema'
import {Toggle} from 'rsuite'
import {LanguagesConfig} from '../../api'
import {MapType} from '../../interfaces/utilTypes'
import {ContentEditActionEnum} from '../../control/contentReducer'
import {generateEmptyContent} from '../../control/contentUtil'
import {isNullOrUndefined} from '../../utility'
import BlockObjectItem from './BlockObjectItem'
import {useTranslation} from 'react-i18next'

export interface LanguageContext {
  readonly languagesConfig: LanguagesConfig
  readonly langLane1: string
  readonly langLane2: string
}

export function BlockObject(
  props: BlockAbstractProps<ContentModelSchemaFieldObject, MapType<any>>
) {
  const {dispatch, languageContext, model, schemaPath, value} = props

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
              dispatch({
                type: ContentEditActionEnum.update,
                value: generateEmptyContent(model, languageContext.languagesConfig),
                path: schemaPath
              })
            }
          }}
        />
      </>
    )
  }

  let content = null
  if (isActive) {
    content = Object.entries(model.fields).map(item => {
      const [key, fieldModel] = item
      const {model, value, ...rest} = props
      return (
        <BlockObjectItem
          key={key}
          {...rest}
          fieldname={key}
          model={fieldModel}
          value={value[key]}></BlockObjectItem>
      )
    })
  }

  return (
    <>
      {toggle}
      {content}
    </>
  )
}

export default BlockObject
