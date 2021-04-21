/* eslint-disable i18next/no-literal-string */
import React from 'react'
import {Icon, TagPicker} from 'rsuite'
import {BlockAbstractProps} from './BlockAbstract'
import {useTranslation} from 'react-i18next'
import {ContentModelSchemaFieldRef} from '@wepublish/api'
import {useContentListLazyQuery} from '../../api'

export function BlockTags({
  dispatch,
  model,
  languageContext,
  value,
  schemaPath
}: BlockAbstractProps<ContentModelSchemaFieldRef, unknown[]>) {
  const {t} = useTranslation()

  const [modelType] = Object.entries(model.types)[0]
  const [getRecords, {loading, data}] = useContentListLazyQuery()

  console.log('data', data)

  function handleSelect(value: any[], item: any, event: any) {
    // _remove(cacheData, v => v === value)
    // cacheData.push(item)
    // setState({...state, cacheData})
  }

  function handleSearch(filter: string) {
    if (!filter) {
      return
    }
    const variables = {type: modelType as any, filter: filter || undefined, first: 10}
    getRecords({
      variables
    })
  }

  function handleChange(value: any) {
    // setState({...state, value})
  }

  const items = data?.content._all.list.nodes || []
  return (
    <TagPicker
      data={items}
      // cacheData={state.cacheData}
      value={items}
      style={{width: 300}}
      labelKey="title"
      valueKey="id"
      onChange={handleChange}
      onSearch={handleSearch}
      onSelect={handleSelect}
      renderMenu={menu => {
        if (loading) {
          return (
            <p style={{padding: 4, color: '#999', textAlign: 'center'}}>
              <Icon icon="spinner" spin /> {t('articleEditor.panels.loading')}
            </p>
          )
        }
        return menu
      }}
    />
  )
}

export default BlockTags
