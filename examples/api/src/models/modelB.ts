import {ContentModel, ContentModelSchemaTypes} from '@wepublish/api'
import {MODEL_A} from './modelA'

export const contentModelB: ContentModel = {
  identifier: 'modelB',
  nameSingular: 'Model B',
  namePlural: 'Models B',
  schema: {
    content: {
      myString: {
        type: ContentModelSchemaTypes.string,
        filterable: true,
        searchable: true,
        defaultValue: 'custom default value!',
        editor: {
          name: 'My String',
          instructions: `Lorem ipsum dolor sit amet, [consectetur](http://google.com) adipiscing elit. __Nunc rutrum__, metus lobortis dapibus tristique, odio sapien eleifend velit, nec mattis ligula augue quis erat`
        }
      },
      myStringI18n: {
        type: ContentModelSchemaTypes.string,
        filterable: true,
        searchable: true,
        i18n: true
      },
      myRichText: {
        type: ContentModelSchemaTypes.richText,
        searchable: true,
        config: {
          bold: true,
          h1: true,
          orderedList: true,
          ref: {
            [MODEL_A]: {
              scope: 'local'
            }
          }
        }
      },
      myInt: {
        type: ContentModelSchemaTypes.int,
        filterable: true,
        defaultValue: 333
      },
      myFloat: {
        type: ContentModelSchemaTypes.float,
        filterable: true
      },
      myBoolean: {
        type: ContentModelSchemaTypes.boolean,
        filterable: true
      },
      myDateTime: {
        type: ContentModelSchemaTypes.dateTime,
        optional: true,
        filterable: true
      },
      myEnum: {
        type: ContentModelSchemaTypes.enum,
        filterable: true,
        values: [
          {
            value: 'foo',
            description: 'Foo'
          },
          {
            value: 'bar',
            description: 'Bar'
          }
        ]
      },
      myList: {
        type: ContentModelSchemaTypes.list,
        contentType: {
          type: ContentModelSchemaTypes.string
        }
      },
      myUnion: {
        type: ContentModelSchemaTypes.union,
        cases: {
          caseA: {
            type: ContentModelSchemaTypes.object,
            fields: {
              foo: {
                type: ContentModelSchemaTypes.boolean
              }
            }
          },
          caseB: {
            type: ContentModelSchemaTypes.object,
            fields: {
              bar: {
                type: ContentModelSchemaTypes.float
              }
            }
          }
        }
      },
      myRef: {
        type: ContentModelSchemaTypes.reference,
        types: {
          [MODEL_A]: {
            scope: 'local'
          }
        },
        filterable: true
      }
    }
  }
}
