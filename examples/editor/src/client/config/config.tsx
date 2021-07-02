/* eslint-disable react/display-name */
import React from 'react'
import {CustomViewExample} from './customView'
import {ContentAEditView} from './contentA'
import {BlockType} from './article/articleInterfaces'
import {getContentView} from './article/articleContentView'
import {ContentMetadataPanel} from './contentAMetadata'
import {EditorConfig} from '@dudagroup/editor'

export const MODEL_MEDIA_LIBRARY = 'mediaLibrary'

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
      icon: 'good',
      deriveSlug: {
        instructions: 'derive slug from field "myStringI18n"',
        jsonPath: '$.content.myStringI18n'
      },
      getContentView: (content, onChange, disabled, dispatch, configs, _, langLaneL, langLaneR) => {
        return (
          <ContentAEditView
            value={content}
            dispatch={dispatch}
            configs={configs}
            langLaneL={langLaneL}
            langLaneR={langLaneR}
          />
        )
      },
      getMetaView: (
        metadata,
        customMetadata,
        onChange,
        onChangeMetadata,
        dispatchCustomMetadata,
        configs,
        _,
        langLaneL,
        langLaneR
      ) => {
        return (
          <ContentMetadataPanel
            configs={configs}
            defaultMetadata={metadata}
            customMetadata={customMetadata}
            onChangeDefaultMetadata={onChange}
            dispatch={dispatchCustomMetadata}
            langLaneL={langLaneL}
            langLaneR={langLaneR}
          />
        )
      },
      getPreviewLink: (token, language, recordData) => {
        return `http://localhost:${
          process.env.WEBSITE_EXAMPLE_PORT || 5000
        }/preview/?lang=${language}&contentType=${recordData.contentType}&id=${
          recordData.id
        }&slug=${recordData.slugI18n[language]}&token=${token}`
      }
    },
    {
      identifier: 'modelB',
      deriveSlug: {
        instructions: 'derive slug from field "myStringI18n"',
        jsonPath: '$.content.myStringI18n'
      }
    },
    {
      identifier: 'article',
      defaultContent: {blocks: [{[BlockType.Title]: {title: '', lead: ''}}]},
      getContentView: getContentView
    },
    {
      identifier: MODEL_MEDIA_LIBRARY,
      previewPath: ['mediaI18n'],
      previewSize: 'big'
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
