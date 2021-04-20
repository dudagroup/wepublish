import {useQuery} from '@apollo/client'
import React, {useContext} from 'react'
import {ContentGetDocument} from '../api'
import {ConfigContext} from '../Editorcontext'
import {getReadQuery} from '../utils/queryUtils'

interface RecordPreviewProps {
  readonly record: {
    id: string
    contentType: string
    title: string
    content?: any
  }
}

export function RecordPreview({record}: RecordPreviewProps) {
  const configs = useContext(ConfigContext)

  const contentModelConfig = configs?.contentModelExtensionMerged.find(
    config => config.identifier === record.contentType
  )

  let query = undefined
  if (configs && contentModelConfig) {
    query = getReadQuery(configs, contentModelConfig)
  }
  const {data} = useQuery(query || ContentGetDocument, {
    skip: !query,
    fetchPolicy: 'no-cache',
    variables: {id: record.id}
  })

  if (
    data?.content &&
    contentModelConfig?.previewPath &&
    contentModelConfig.previewPath.length > 0
  ) {
    const r: any = Object.values(data.content)[0]
    const content = r.read.content
    const previewObject = content[contentModelConfig?.previewPath[0]]
    if (previewObject?.media.image) {
      return <img src={previewObject?.media.url} />
    }

    return <>{previewObject}</>
  } else if (record.title) {
    return <>{record.title}</>
  }
  return <>{`Type: ${record.contentType} Id: ${record.id}`}</>
}
