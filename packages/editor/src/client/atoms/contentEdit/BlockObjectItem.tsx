import React, {memo} from 'react'
import BlockAbstract, {BlockAbstractProps} from './BlockAbstract'
import {
  ContentModelSchemaFieldLeaf,
  ContentModelSchemas,
  ContentModelSchemaTypes
} from '../../interfaces/contentModelSchema'
import {Col, ControlLabel, FormGroup, Row, Toggle} from 'rsuite'
import {LanguagesConfig} from '../../api'
import {I18nWrapper} from './i18nWrapper'
import {MapType} from '../../interfaces/utilTypes'
import Instructions from './Instructions'
import {ContentEditActionEnum} from '../../control/contentReducer'
import {generateEmptyContent} from '../../control/contentUtil'

export interface LanguageContext {
  readonly languagesConfig: LanguagesConfig
  readonly langLane1: string
  readonly langLane2: string
}

const labelStyle = {marginTop: 30, height: '24px'}

function BlockObjectItem({
  dispatch,
  languageContext,
  model,
  schemaPath,
  value: v,
  configs,
  fieldname
}: BlockAbstractProps<ContentModelSchemas, MapType<any>> & {fieldname: string}) {
  const langLane1 = languageContext.langLane1
  const langLane2 = languageContext.langLane2

  const name = model.editor?.name || fieldname
  const childSchemaPath = [...schemaPath, fieldname]

  if ((model as ContentModelSchemaFieldLeaf).i18n) {
    if (!v) {
      return (
        <FormGroup key={fieldname}>
          <div className="wep-label" style={labelStyle}>
            <ControlLabel style={{display: 'inline-block'}}>{name}</ControlLabel>
            <Instructions instructions={model.editor?.instructions}></Instructions>
          </div>
          <Toggle
            size="sm"
            checked={false}
            onChange={() => {
              dispatch({
                type: ContentEditActionEnum.update,
                value: generateEmptyContent(model, languageContext.languagesConfig),
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
            <Instructions instructions={model.editor?.instructions}></Instructions>
          </div>
          <BlockAbstract
            configs={configs}
            schemaPath={[...childSchemaPath, langLane1]}
            dispatch={dispatch}
            model={model}
            languageContext={languageContext}
            currentLang={langLane1}
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
            model={model}
            languageContext={languageContext}
            currentLang={langLane2}
            value={v[langLane2]}></BlockAbstract>
        </>
      )
    }
    return <I18nWrapper key={fieldname} lane1={componentLane1} lane2={componentLane2} />
  }

  let colWith = 14
  if (
    model.type === ContentModelSchemaTypes.list ||
    model.type === ContentModelSchemaTypes.union ||
    model.type === ContentModelSchemaTypes.object
  ) {
    colWith = 24
  }
  return (
    <Row key={fieldname} className="show-grid" style={{marginBottom: 0}}>
      <Col xs={colWith}>
        <FormGroup>
          <div className="wep-label" style={labelStyle}>
            <ControlLabel style={{display: 'inline-block'}}>{name}</ControlLabel>
            <Instructions instructions={model.editor?.instructions}></Instructions>
          </div>
          <BlockAbstract
            configs={configs}
            schemaPath={childSchemaPath}
            dispatch={dispatch}
            model={model}
            languageContext={languageContext}
            value={v}></BlockAbstract>
        </FormGroup>
      </Col>
    </Row>
  )
}

export default memo(BlockObjectItem, (prev, next) => {
  return (
    Object.is(prev.value, next.value) &&
    Object.is(prev.fieldname, next.fieldname) &&
    Object.is(prev.languageContext.langLane1, next.languageContext.langLane1) &&
    Object.is(prev.languageContext.langLane2, next.languageContext.langLane2)
  )
})
