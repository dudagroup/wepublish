import {useQuery} from '@apollo/client'
import {useContext} from 'react'
import {ContentGetDocument} from '../api'
import {ConfigContext} from '../Editorcontext'
import {Reference} from '../interfaces/referenceType'
import {getReadQuery} from '../utils/queryUtils'

export interface RecordData {
  content?: unknown
  meta?: unknown
}
export function useRecordHook<T extends RecordData>(
  reference?: Reference<T> | null
): T | undefined {
  const configs = useContext(ConfigContext)

  const contentModelConfig = configs?.contentModelExtensionMerged.find(
    config => config.identifier === reference?.contentType
  )

  let query
  if (configs && contentModelConfig) {
    query = getReadQuery(configs, contentModelConfig)
  }
  const {data} = useQuery(query || ContentGetDocument, {
    skip: !query || !!reference?.record?.content,
    fetchPolicy: 'no-cache',
    variables: {id: reference?.recordId}
  })

  if (
    data?.content &&
    contentModelConfig?.previewPath &&
    contentModelConfig.previewPath.length > 0
  ) {
    const r = Object.values(data.content)[0] as {read: T}
    return r.read
  }

  return reference?.record
}
