import {ContentModel, ContentModelSchemaTypes} from '@wepublish/api'

export const MODEL_A = 'modelA'

export const contentModelA: ContentModel = {
  identifier: 'modelA',
  nameSingular: 'Model A',
  namePlural: 'Models A',
  schema: {
    content: {
      myString: {
        type: ContentModelSchemaTypes.string,
        deprecationReason: "it's very old",
        instructions: 'this is an ordinary string',
        optional: true
      },
      myStringI18n: {
        type: ContentModelSchemaTypes.string,
        i18n: true,
        optional: true
      }
    }
  }
}
