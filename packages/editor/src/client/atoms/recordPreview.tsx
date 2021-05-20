import React, {useContext} from 'react'
import {useRecordHook} from '../control/recordHook'
import {ConfigContext} from '../Editorcontext'

interface RecordPreviewProps {
  readonly record: {
    id: string
    contentType: string
    title: string
    content?: any
    meta?: any
  }
}

export function RecordPreview({record}: RecordPreviewProps) {
  const enrichedRecord = useRecordHook({
    recordId: record.id,
    contentType: record.contentType,
    record
  })
  const configs = useContext(ConfigContext)

  const contentModelConfig = configs?.contentModelExtensionMerged.find(
    config => config.identifier === record.contentType
  )

  if (!enrichedRecord) {
    return null
  }

  if (
    enrichedRecord.content &&
    contentModelConfig?.previewPath &&
    contentModelConfig.previewPath.length > 0
  ) {
    // TODO resolve full preview path and support also metha paths
    const schemaContent = contentModelConfig?.schema.content[contentModelConfig?.previewPath[0]]
    let previewObject = enrichedRecord.content[contentModelConfig?.previewPath[0]]

    if (previewObject) {
      if (schemaContent.i18n) {
        const lang = configs.apiConfig.languages.languages.find(
          l => l.tag === configs.apiConfig.languages.defaultLanguageTag
        )
        previewObject = previewObject[lang?.tag || '']
      }

      if (previewObject?.media?.image) {
        const url = previewObject?.media.url as string
        if (
          url.endsWith('jpg') ||
          url.endsWith('jpeg' || url.endsWith('png' || url.endsWith('gif') || url.endsWith('svg')))
        ) {
          return <img src={previewObject.media.url} style={{height: 100, width: 'auto'}} />
        }
      }

      if (typeof previewObject !== 'string') {
        previewObject = enrichedRecord.title || enrichedRecord.id
      }

      return <>{previewObject}</>
    }
  } else if (enrichedRecord.title) {
    return <>{enrichedRecord.title}</>
  }
  return <>{enrichedRecord.id}</>
}
