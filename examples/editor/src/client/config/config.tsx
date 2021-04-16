import React from 'react'
import {CustomViewExample} from './customView'
import {ContentA_EditView} from './contentA'
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
      defaultContent: {
        myString: '',
        myStringI18n: {
          de: '',
          en: ''
        },
        myRichText: [
          {
            type: 'paragraph',
            children: [
              {
                text: ''
              }
            ]
          }
        ],
        myRichTextI18n: {
          de: [
            {
              type: 'paragraph',
              children: [
                {
                  text: ''
                }
              ]
            }
          ],
          en: [
            {
              type: 'paragraph',
              children: [
                {
                  text: ''
                }
              ]
            }
          ]
        },
        myRef: null
      },
      defaultMeta: {
        myString: '',
        myStringI18n: {
          de: '',
          en: ''
        },
        myRichText: [
          {
            type: 'paragraph',
            children: [
              {
                text: ''
              }
            ]
          }
        ],
        myRichTextI18n: {
          de: [
            {
              type: 'paragraph',
              children: [
                {
                  text: ''
                }
              ]
            }
          ],
          en: [
            {
              type: 'paragraph',
              children: [
                {
                  text: ''
                }
              ]
            }
          ]
        },
        myRef: null
      },
      getContentView: (content, onChange) => {
        return <ContentA_EditView value={content} onChange={onChange} />
      },
      getMetaView: (metadata, customMetadata, onChange, onChangeMetadata) => {
        return (
          <ContentMetadataPanel
            defaultMetadata={metadata}
            customMetadata={customMetadata}
            onChangeDefaultMetadata={onChange}
            onChangeCustomMetadata={onChangeMetadata}
          />
        )
      }
    },
    {
      identifier: 'article',
      defaultContent: {blocks: [{[BlockType.Title]: {title: '', lead: ''}}]},
      getContentView: getContentView
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
