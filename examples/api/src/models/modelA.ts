import {ContentModel, ContentModelSchemaTypes} from '@wepublish/api'

export const contentModelA: ContentModel = {
  identifier: 'modelA',
  nameSingular: 'Model A',
  namePlural: 'Models A',
  schema: {
    content: {
      myString: {
        type: ContentModelSchemaTypes.string,
        deprecationReason: "it's very old",
        instructions: 'this is an ordinary string'
      },
      myStringI18n: {
        type: ContentModelSchemaTypes.string,
        i18n: true
      },
      myRichText: {
        type: ContentModelSchemaTypes.richText,
        config: {
          italic: true,
          bold: true,
          ref: {
            modelB: {
              scope: 'local'
            }
          }
        }
      },
      myRichTextI18n: {
        type: ContentModelSchemaTypes.richText,
        i18n: true
      },
      myRef: {
        type: ContentModelSchemaTypes.reference,
        types: {
          modelA: {
            scope: 'local'
          },
          modelB: {
            scope: 'local'
          }
        }
      },
      myRefI18n: {
        type: ContentModelSchemaTypes.reference,
        i18n: true,
        types: {
          modelA: {
            scope: 'local'
          },
          modelB: {
            scope: 'local'
          }
        }
      },
      myRefList: {
        type: ContentModelSchemaTypes.list,
        contentType: {
          type: ContentModelSchemaTypes.reference,
          types: {
            modelB: {
              scope: 'local'
            }
          }
        }
      }
    },
    meta: {
      myString: {
        type: ContentModelSchemaTypes.string
      },
      myStringI18n: {
        type: ContentModelSchemaTypes.string,
        i18n: true
      },
      myRichText: {
        type: ContentModelSchemaTypes.richText
      },
      myRichTextI18n: {
        type: ContentModelSchemaTypes.richText,
        i18n: true
      },
      myRef: {
        type: ContentModelSchemaTypes.reference,
        types: {
          modelA: {
            scope: 'local'
          },
          modelB: {
            scope: 'local'
          }
        }
      }
    }
  }
}
