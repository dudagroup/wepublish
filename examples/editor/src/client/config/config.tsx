/* eslint-disable react/display-name */
import React from 'react'
import {CustomViewExample} from './customView'
import {ContentAEditView} from './contentA'
import {BlockType} from './article/articleInterfaces'
import {getContentView} from './article/articleContentView'
import {ContentMetadataPanel} from './contentAMetadata'
import {EditorConfig} from '@wepublish/editor'

export const config: EditorConfig = {
  navigationBar: {
    articlesActive: false,
    pagesActive: false,
    imageLibraryActive: false,
    authorsActive: false,
    navigationActive: false,
    commentsActive: false
  },
  contentModelExtension: [
    {
      identifier: 'modelA',
      getContentView: (content, onChange, disabled, dispatch) => {
        return <ContentAEditView value={content} dispatch={dispatch} />
      },
      getMetaView: (
        metadata,
        customMetadata,
        onChange,
        onChangeMetadata,
        dispatchCustomMetadata
      ) => {
        return (
          <ContentMetadataPanel
            defaultMetadata={metadata}
            customMetadata={customMetadata}
            onChangeDefaultMetadata={onChange}
            dispatch={dispatchCustomMetadata}
          />
        )
      }
    },
    {
      identifier: 'article',
      defaultContent: {blocks: [{[BlockType.Title]: {title: '', lead: ''}}]},
      getContentView: getContentView
    },
    {
      identifier: 'mediaLibrary',
      previewPath: ['media']
    }
  ],
  cusomExtension: [
    {
      identifier: 'customView',
      nameSingular: 'Custom View',
      namePlural: 'Custom View',
      view: <CustomViewExample />
    }
  ]
}
