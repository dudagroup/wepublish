import React from 'react'
import BlockAbstract from './BlockAbstract'
import {
  ContentModelSchemaFieldLeaf,
  ContentModelSchemaFieldObject
} from '../../interfaces/contentModelSchema'
import {ControlLabel, FormGroup, HelpBlock} from 'rsuite'
import {SchemaPath} from '../../interfaces/utilTypes'
import {LanguagesConfig} from '../../api'
import {I18nWrapper} from './i18nWrapper'
import {ContentEditAction} from '../../routes/contentEditor'

export interface LanguageContext {
  readonly languagesConfig: LanguagesConfig
  readonly langLane1: string
  readonly langLane2: string
}

interface BlockObjectProps {
  readonly schemaPath: SchemaPath
  readonly dispatch: React.Dispatch<ContentEditAction>
  readonly record: {[key: string]: any}
  readonly model: ContentModelSchemaFieldObject
  readonly languageContext: LanguageContext
}

export function BlockObject({
  dispatch,
  languageContext,
  model,
  schemaPath,
  record
}: BlockObjectProps) {
  const langLane1 = languageContext.langLane1
  const langLane2 = languageContext.langLane2
  const content = Object.entries(model.fields).map(item => {
    const [key, fieldModel] = item
    let value = record[key]

    const childSchemaPath = [...schemaPath]
    childSchemaPath.push(key)

    if ((fieldModel as ContentModelSchemaFieldLeaf).i18n) {
      let componentLane1 = null
      if (langLane1) {
        componentLane1 = (
          <BlockAbstract
            schemaPath={[...childSchemaPath, langLane1]}
            dispatch={dispatch}
            model={fieldModel}
            languageContext={languageContext}
            content={value[langLane1]}></BlockAbstract>
        )
      }

      let componentLane2 = null
      if (langLane2) {
        componentLane2 = (
          <BlockAbstract
            schemaPath={[...childSchemaPath, langLane2]}
            dispatch={dispatch}
            model={fieldModel}
            languageContext={languageContext}
            content={value[langLane2]}></BlockAbstract>
        )
      }
      return <I18nWrapper key={key} lane1={componentLane1} lane2={componentLane2} />
    }

    return (
      <FormGroup key={key}>
        <ControlLabel>{key}</ControlLabel>
        {
          <BlockAbstract
            schemaPath={childSchemaPath}
            dispatch={dispatch}
            model={fieldModel}
            languageContext={languageContext}
            content={value}></BlockAbstract>
        }
        <HelpBlock tooltip>Example Instructions</HelpBlock>
      </FormGroup>
    )
  })

  return <>{content}</>
}

export default BlockObject
