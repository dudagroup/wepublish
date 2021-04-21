import {useQuery} from '@apollo/client'
import {useContext} from 'react'
import {ContentGetDocument} from '../api'
import {ConfigContext} from '../Editorcontext'
import {Reference} from '../interfaces/referenceType'
import {getReadQuery} from '../utils/queryUtils'

export function useRecordHook(reference?: Reference) {
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
    const r: any = Object.values(data.content)[0]
    return r.read
  }

  return reference?.record
}
