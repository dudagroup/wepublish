import React from 'react'
import {SelectPicker} from 'rsuite'
import {ContentEditActionEnum} from '../../control/contentReducer'
import {generateEmptyContent} from '../../control/contentUtil'
import {ContentModelSchemaFieldUnion} from '../../interfaces/contentModelSchema'
import BlockAbstract, {BlockAbstractProps} from './BlockAbstract'

export function BlockUnion({
  value,
  model,
  dispatch,
  languageContext,
  schemaPath,
  configs
}: BlockAbstractProps<ContentModelSchemaFieldUnion, {[key: string]: unknown}>) {
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
              path: schemaPath
            })
          }
        }}
      />
      {
        <BlockAbstract
          configs={configs}
          schemaPath={updatePath}
          dispatch={dispatch}
          model={model.cases[currentCase]}
          languageContext={languageContext}
          value={val}></BlockAbstract>
      }
    </div>
  )
}

export default BlockUnion
