import {ContentModel, ContentModelSchemaTypes} from '@dudagroup/api'

export const typeMediaLibrary = 'mediaLibrary'
export const contentModelMediaLibrary: ContentModel = {
  identifier: typeMediaLibrary,
  nameSingular: 'Media',
  namePlural: 'Media',
  schema: {
    content: {
      media: {
        type: ContentModelSchemaTypes.media
      },
      mediaI18n: {
        type: ContentModelSchemaTypes.media,
        i18n: true
      },
      title: {
        type: ContentModelSchemaTypes.string,
        i18n: true
      },
      description: {
        type: ContentModelSchemaTypes.string,
        i18n: true
      },
      source: {
        type: ContentModelSchemaTypes.string
      },
      license: {
        type: ContentModelSchemaTypes.string
      },
      authors: {
        type: ContentModelSchemaTypes.list,
        contentType: {
          type: ContentModelSchemaTypes.reference,
          types: {
            author: {
              scope: 'local'
            }
          }
        }
      }
    }
  }
}
