import React from 'react'
import BlockAbstract, {BlockAbstractProps} from './BlockAbstract'
import {
  ContentModelSchemaFieldLeaf,
  ContentModelSchemaFieldObject,
  ContentModelSchemaTypes
} from '../../interfaces/contentModelSchema'
import {Col, ControlLabel, FormGroup, Row, Toggle} from 'rsuite'
import {LanguagesConfig} from '../../api'
import {I18nWrapper} from './i18nWrapper'
import {MapType} from '../../interfaces/utilTypes'
import Instructions from './Instructions'
import {ContentEditActionEnum} from '../../control/contentReducer'
import {generateEmptyContent} from '../../control/contentUtil'
import {isNullOrUndefined} from '../../utility'
import {useTranslation} from 'react-i18next'

export interface LanguageContext {
  readonly languagesConfig: LanguagesConfig
  readonly langLane1: string
  readonly langLane2: string
}

const labelStyle = {marginTop: 30, height: '24px'}

export function BlockObject({
  dispatch,
  languageContext,
  model,
  schemaPath,
  value,
  configs
}: BlockAbstractProps<ContentModelSchemaFieldObject, MapType<any>>) {
  const langLane1 = languageContext.langLane1
  const langLane2 = languageContext.langLane2
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
      const v = value[key]
      const name = fieldModel.editor?.name || key

      const childSchemaPath = [...schemaPath]
      childSchemaPath.push(key)

      if ((fieldModel as ContentModelSchemaFieldLeaf).i18n) {
        if (!v) {
          return (
            <FormGroup key={key}>
              <div className="wep-label" style={labelStyle}>
                <ControlLabel style={{display: 'inline-block'}}>{name}</ControlLabel>
                <Instructions instructions={fieldModel.editor?.instructions}></Instructions>
              </div>
              <Toggle
                size="sm"
                checked={false}
                onChange={() => {
                  dispatch({
                    type: ContentEditActionEnum.update,
                    value: generateEmptyContent(fieldModel, languageContext.languagesConfig),
                    path: childSchemaPath
                  })
                }}
              />
            </FormGroup>
          )
        }

        let componentLane1 = null
        if (langLane1) {
          componentLane1 = (
            <>
              <div className="wep-label" style={labelStyle}>
                <ControlLabel style={{display: 'inline-block'}}>{name}</ControlLabel>
                <Instructions instructions={fieldModel.editor?.instructions}></Instructions>
              </div>
              <BlockAbstract
                configs={configs}
                schemaPath={[...childSchemaPath, langLane1]}
                dispatch={dispatch}
                model={fieldModel}
                languageContext={languageContext}
                value={v[langLane1]}></BlockAbstract>
            </>
          )
        }

        let componentLane2 = null
        if (langLane2) {
          componentLane2 = (
            <>
              <div className="wep-label" style={labelStyle}></div>
              <BlockAbstract
                configs={configs}
                disabled
                schemaPath={[...childSchemaPath, langLane2]}
                dispatch={dispatch}
                model={fieldModel}
                languageContext={languageContext}
                value={v[langLane2]}></BlockAbstract>
            </>
          )
        }
        return <I18nWrapper key={key} lane1={componentLane1} lane2={componentLane2} />
      }

      let colWith = 14
      if (
        fieldModel.type === ContentModelSchemaTypes.list ||
        fieldModel.type === ContentModelSchemaTypes.union ||
        fieldModel.type === ContentModelSchemaTypes.object
      ) {
        colWith = 24
      }
      return (
        <Row key={key} className="show-grid" style={{marginBottom: 0}}>
          <Col xs={colWith}>
            <FormGroup>
              <div className="wep-label" style={labelStyle}>
                <ControlLabel style={{display: 'inline-block'}}>{name}</ControlLabel>
                <Instructions instructions={fieldModel.editor?.instructions}></Instructions>
              </div>
              <BlockAbstract
                configs={configs}
                schemaPath={childSchemaPath}
                dispatch={dispatch}
                model={fieldModel}
                languageContext={languageContext}
                value={v}></BlockAbstract>
            </FormGroup>
          </Col>
        </Row>
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
