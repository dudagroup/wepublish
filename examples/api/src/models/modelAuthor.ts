import {ContentModel, ContentModelSchemaTypes} from '@wepublish/api'

export const contentModelAuthor: ContentModel = {
  identifier: 'author',
  nameSingular: 'Author',
  namePlural: 'Author',
  schema: {
    content: {
      name: {
        type: ContentModelSchemaTypes.string
      },
      jobTitle: {
        type: ContentModelSchemaTypes.string
      },
      biographicalInformation: {
        type: ContentModelSchemaTypes.richText
      },
      links: {
        type: ContentModelSchemaTypes.list,
        contentType: {
          type: ContentModelSchemaTypes.object,
          fields: {
            title: {
              type: ContentModelSchemaTypes.string
            },
            link: {
              type: ContentModelSchemaTypes.string
            }
          }
        }
      }
    }
  }
}
