import React from 'react'
import {SelectPicker} from 'rsuite'
import {ContentEditActionEnum} from '../../control/contentReducer'
import {generateEmptyContent} from '../../control/contentUtil'
import {ContentModelSchemaFieldUnion} from '../../interfaces/contentModelSchema'
import {destructUnionCase} from '../../utility'
import BlockAbstract, {BlockAbstractProps} from './BlockAbstract'

export function BlockUnion({
  value,
  model,
  dispatch,
  languageContext,
  schemaPath,
  configs
}: BlockAbstractProps<ContentModelSchemaFieldUnion, {[key: string]: unknown}>) {
  if (!(value && Object.entries(value).length === 1) && !model.optional) {
    return null
  }
  const {unionCase, val} = destructUnionCase(value)
  const data = Object.keys(model.cases).map(key => {
    return {
      label: key,
      value: key
    }
  })

  return (
    <div>
      <SelectPicker
        cleanable={!!model.optional}
        searchable={false}
        data={data}
        value={unionCase}
        onChange={nextCase => {
          if (!nextCase) {
            dispatch({
              type: ContentEditActionEnum.update,
              value: null,
              path: schemaPath
            })
          } else if (nextCase !== unionCase) {
            dispatch({
              type: ContentEditActionEnum.update,
              value: {
                [nextCase]: generateEmptyContent(
                  model.cases[nextCase],
                  languageContext.languagesConfig
                )
              },
              path: schemaPath
            })
          }
        }}
      />
      {unionCase && (
        <BlockAbstract
          configs={configs}
          schemaPath={[...schemaPath, unionCase]}
          dispatch={dispatch}
          model={model.cases[unionCase]}
          languageContext={languageContext}
          value={val}></BlockAbstract>
      )}
    </div>
  )
}

export default BlockUnion
