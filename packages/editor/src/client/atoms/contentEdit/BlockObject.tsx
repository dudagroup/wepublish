import React from 'react'
import BlockAbstract from './BlockAbstract'
import {
  ContentModelSchemaFieldLeaf,
  ContentModelSchemaFieldObject
} from '../../interfaces/contentModelSchema'
import {ControlLabel, FormGroup, Toggle} from 'rsuite'
import {SchemaPath} from '../../interfaces/utilTypes'
import {LanguagesConfig} from '../../api'
import {I18nWrapper} from './i18nWrapper'

export interface LanguageContext {
  readonly languagesConfig: LanguagesConfig
  readonly langLane1: string
  readonly langLane2: string
}

export function BlockObject(props: {
  readonly schemaPath: SchemaPath
  readonly dispatch: React.Dispatch<any>
  readonly record: {[key: string]: any}
  readonly model: ContentModelSchemaFieldObject
  readonly languageContext: LanguageContext
}) {
  const langLane1 = props.languageContext.langLane1
  const langLane2 = props.languageContext.langLane2
  const content = Object.entries(props.model.fields).map(item => {
    const [key, fieldModel] = item
    const value = props.record[key]
    const schemaPath = [...props.schemaPath]
    schemaPath.push(key)

    const hasContent = !!props.record[key]
    const required = fieldModel.required ? (
      <Toggle
        size="lg"
        checkedChildren="Active"
        unCheckedChildren="Inactive"
        checked={hasContent}
        onChange={e => {}}
      />
    ) : null

    if ((fieldModel as ContentModelSchemaFieldLeaf).i18n) {
      let componentLane1 = null
      if (langLane1) {
        componentLane1 = (
          <BlockAbstract
            schemaPath={[...schemaPath, langLane1]}
            dispatch={props.dispatch}
            model={fieldModel}
            languageContext={props.languageContext}
            content={value[langLane1]}></BlockAbstract>
        )
      }
      let componentLane2 = null
      if (langLane2) {
        componentLane2 = (
          <BlockAbstract
            schemaPath={[...schemaPath, langLane2]}
            dispatch={props.dispatch}
            model={fieldModel}
            languageContext={props.languageContext}
            content={value[langLane2]}></BlockAbstract>
        )
      }
      return <I18nWrapper key={key} lane1={componentLane1} lane2={componentLane2} />
    }
    return (
      <FormGroup key={key}>
        <ControlLabel>{key}</ControlLabel>
        {required}
        <BlockAbstract
          schemaPath={schemaPath}
          dispatch={props.dispatch}
          model={fieldModel}
          languageContext={props.languageContext}
          content={value}></BlockAbstract>
      </FormGroup>
    )
  })

  return <>{content}</>
}

export default BlockObject
