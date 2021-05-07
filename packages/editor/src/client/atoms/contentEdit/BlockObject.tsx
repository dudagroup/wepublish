import React from 'react'
import BlockAbstract, {BlockAbstractProps} from './BlockAbstract'
import {
  ContentModelSchemaFieldLeaf,
  ContentModelSchemaFieldObject
} from '../../interfaces/contentModelSchema'
import {ControlLabel, FormGroup, Toggle} from 'rsuite'
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

  const content = Object.entries(model.fields).map(item => {
    const [key, fieldModel] = item
    const v = value[key]
    const name = fieldModel.editor?.name || key

    const childSchemaPath = [...schemaPath]
    childSchemaPath.push(key)

    if ((fieldModel as ContentModelSchemaFieldLeaf).i18n) {
      if (!v) {
        return (
          <FormGroup key={key}>
            <div className="wep-label">
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
            <div className="wep-label">
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
            <div className="wep-label">
              <ControlLabel style={{display: 'inline-block'}}>{name}</ControlLabel>
              <Instructions instructions={fieldModel.editor?.instructions}></Instructions>
            </div>
            <BlockAbstract
              configs={configs}
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

    return (
      <FormGroup key={key}>
        <div className="wep-label">
          <ControlLabel style={{display: 'inline-block'}}>{name}</ControlLabel>
          <Instructions instructions={fieldModel.editor?.instructions}></Instructions>
        </div>
        {
          <BlockAbstract
            configs={configs}
            schemaPath={childSchemaPath}
            dispatch={dispatch}
            model={fieldModel}
            languageContext={languageContext}
            value={v}></BlockAbstract>
        }
      </FormGroup>
    )
  })

  return <>{content}</>
}

export default BlockObject
