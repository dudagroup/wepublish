import {ContentModel, ContentModelSchemaTypes} from '@wepublish/api'

export const contentModelMediaLibrary: ContentModel = {
  identifier: 'mediaLibrary',
  nameSingular: 'Media Library',
  namePlural: 'Media',
  schema: {
    content: {
      media: {
        type: ContentModelSchemaTypes.media
      },
      title: {
        type: ContentModelSchemaTypes.string
      },
      description: {
        type: ContentModelSchemaTypes.string
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
