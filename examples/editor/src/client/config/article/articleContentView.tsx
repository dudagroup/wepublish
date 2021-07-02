import {Configs, ContentModelConfigMerged, getContentViewFunction} from '@dudagroup/editor'
import {ContentEditAction} from '@dudagroup/editor/lib/client/control/contentReducer'
import React from 'react'
import {BlockList} from './atoms/blockList'

export const getContentView: getContentViewFunction = (
  content: any,
  handleChange: any,
  disabled: boolean,
  dispatch: React.Dispatch<ContentEditAction>,
  configs: Configs,
  contentModelConfigMerged: ContentModelConfigMerged
) => {
  return (
    <BlockList
      value={content}
      onChange={handleChange}
      disabled={disabled}
      dispatch={dispatch}
      configs={configs}
      contentModelConfigMerged={contentModelConfigMerged}></BlockList>
  )
}
