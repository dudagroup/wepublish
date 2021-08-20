import React, {useEffect, useState} from 'react'
import {Icon, TagPicker} from 'rsuite'
import {BlockAbstractProps} from './BlockAbstract'
import {useTranslation} from 'react-i18next'
import {ContentModelSchemaFieldRef} from '@dudagroup/api'
import {ContentModelSummary, ContentTypeEnum, useContentListLazyQuery} from '../../api'
import {ContentEditActionEnum} from '../../control/contentReducer'
import {Reference} from '../../interfaces/referenceType'
import {MapType} from '../../interfaces/utilTypes'
import {genericBlockMinWidth} from './BlockStyle'

export function BlockTags({
  dispatch,
  model,
  value,
  schemaPath
}: BlockAbstractProps<ContentModelSchemaFieldRef, Reference[]>) {
  const {t} = useTranslation()

  const [modelType] = Object.entries(model.types)[0]
  const [getRecords, {loading, data}] = useContentListLazyQuery()
  const [cache, setCache] = useState<MapType<ContentModelSummary>>({})

  let items: {[key: string]: {id: string; title: string}} = {}
  items = value.reduce((accu, item) => {
    accu[item.recordId] = {
      id: item.recordId,
      title: 'unresolved ref: ' + item.recordId
    }

    return accu
  }, items)

  if (data) {
    items = data.content._all.list.nodes.reduce((accu, item) => {
      accu[item.content.id] = item.content
      return accu
    }, items)
  }

  const itemArray = Object.values(items)

  useEffect(() => {
    if (!data) {
      const variables = {type: modelType as ContentTypeEnum, filter: undefined, first: 100} // TODO load by id's instead of just first 100
      getRecords({
        variables
      })
    } else {
      setCache(
        itemArray.reduce((accu, item) => {
          accu[item.id] = item
          return accu
        }, Object.assign({}, cache) as MapType<any>)
      )
    }
  }, [data])

  function handleSearch(filter: string) {
    if (!filter) {
      return
    }
    const variables = {type: modelType as ContentTypeEnum, filter: filter || undefined, first: 10}
    getRecords({
      variables
    })
  }

  function handleChange(value: string[]) {
    dispatch({
      type: ContentEditActionEnum.update,
      path: schemaPath,
      value: value.map(v => {
        const ref: Reference = {
          contentType: modelType,
          recordId: v
        }
        return ref
      })
    })
  }

  return (
    <TagPicker
      data={itemArray}
      cacheData={Object.values(cache)}
      value={value.map(r => {
        return r.recordId
      })}
      style={{minWidth: genericBlockMinWidth, paddingBottom: 2}}
      labelKey="title"
      valueKey="id"
      onChange={handleChange}
      onSearch={handleSearch}
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
