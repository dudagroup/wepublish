import React from 'react'
import {SelectPicker} from 'rsuite'
import {ContentModelSchemaFieldUnion} from '../../interfaces/contentModelSchema'
import {SchemaPath} from '../../interfaces/utilTypes'
import {
  ContentEditAction,
  ContentEditActionEnum,
  generateEmptyContent
} from '../../routes/contentEditor'
import BlockAbstract from './BlockAbstract'
import {LanguageContext} from './BlockObject'

interface BlockUnionProp {
  readonly schemaPath: SchemaPath
  readonly dispatch: React.Dispatch<ContentEditAction>
  readonly value: {[key: string]: unknown}
  readonly model: ContentModelSchemaFieldUnion
  readonly languageContext: LanguageContext
}

export function BlockUnion({value, model, dispatch, languageContext, schemaPath}: BlockUnionProp) {
  if (!(value && Object.entries(value).length === 1)) {
    return null
  }
  const myCase = Object.entries(value)[0]
  const [currentCase, val] = myCase
  const updatePath = [...schemaPath]
  updatePath.push(currentCase)

  const data = Object.keys(model.cases).map(key => {
    return {
      label: key,
      value: key
    }
  })

  return (
    <div>
      <SelectPicker
        cleanable={false}
        data={data}
        value={currentCase}
        onChange={nextCase => {
          if (nextCase !== currentCase) {
            dispatch({
              type: ContentEditActionEnum.update,
              value: {
                [nextCase]: generateEmptyContent(
                  model.cases[nextCase],
                  languageContext.languagesConfig
                )
              },
              schemaPath
            })
          }
        }}
      />
      {
        <BlockAbstract
          schemaPath={updatePath}
          dispatch={dispatch}
          model={model.cases[currentCase]}
          languageContext={languageContext}
          content={val}></BlockAbstract>
      }
    </div>
  )
}

export default BlockUnion
