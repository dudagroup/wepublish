import {ContentModel, ContentModelSchemaTypes} from '@wepublish/api'
import {MODEL_A} from './modelA'
import {typeMediaLibrary} from './modelMediaLibrary'

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
        editor: {
          name: 'My String',
          instructions: `Lorem ipsum dolor sit amet, [consectetur](http://google.com) adipiscing elit. __Nunc rutrum__, metus lobortis dapibus tristique, odio sapien eleifend velit, nec mattis ligula augue quis erat`,
          inputRows: 2,
          inputType: 'tel',
          maxCharacters: 10,
          placeholder: 'placeholder example'
        }
      },
      myStringI18n: {
        type: ContentModelSchemaTypes.string,
        filterable: true,
        searchable: true,
        i18n: true,
        defaultValue: 'custom default value!'
      },
      myOptionalString: {
        type: ContentModelSchemaTypes.string,
        optional: true,
        editor: {
          instructions: 'This is an optional field'
        }
      },
      myOptionalStringI18n: {
        type: ContentModelSchemaTypes.string,
        i18n: true,
        optional: true,
        editor: {
          instructions: 'This is an optional i18n field'
        }
      },
      myRichText: {
        type: ContentModelSchemaTypes.richText,
        searchable: true,
        config: {
          bold: true,
          h1: true,
          h2: true,
          h3: true,
          h4: true,
          h5: true,
          h6: true,
          orderedList: true,
          ref: {
            [MODEL_A]: {
              scope: 'local'
            }
          }
        }
      },
      myRichTextI18n: {
        type: ContentModelSchemaTypes.richText,
        searchable: true,
        i18n: true,
        config: {
          bold: true,
          h1: true,
          h2: true,
          h3: true,
          h4: true,
          h5: true,
          h6: true,
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
      myOptionalEnum: {
        type: ContentModelSchemaTypes.enum,
        optional: true,
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
      myListNested: {
        type: ContentModelSchemaTypes.list,
        contentType: {
          type: ContentModelSchemaTypes.object,
          fields: {
            foo: {
              type: ContentModelSchemaTypes.string
            },
            bar: {
              type: ContentModelSchemaTypes.string,
              i18n: true,
              optional: true
            },
            list: {
              type: ContentModelSchemaTypes.list,
              contentType: {
                type: ContentModelSchemaTypes.object,
                fields: {
                  nestedFoo: {
                    type: ContentModelSchemaTypes.string
                  },
                  nestedBar: {
                    type: ContentModelSchemaTypes.string,
                    i18n: true
                  }
                }
              }
            }
          }
        }
      },
      myUnion: {
        type: ContentModelSchemaTypes.union,
        cases: {
          caseA: {
            type: ContentModelSchemaTypes.object,
            fields: {
              foo: {
                type: ContentModelSchemaTypes.string,
                i18n: true
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
      myOptionalUnion: {
        type: ContentModelSchemaTypes.union,
        optional: true,
        cases: {
          caseA: {
            type: ContentModelSchemaTypes.object,
            fields: {
              foo: {
                type: ContentModelSchemaTypes.string,
                i18n: true
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
          },
          [typeMediaLibrary]: {
            scope: 'local'
          }
        },
        filterable: true
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
      myOptionalObject: {
        type: ContentModelSchemaTypes.object,
        optional: true,
        fields: {
          myFieldA: {
            type: ContentModelSchemaTypes.string
          }
        }
      },
      myTags: {
        type: ContentModelSchemaTypes.list,
        contentType: {
          type: ContentModelSchemaTypes.reference,
          types: {
            [MODEL_A]: {
              scope: 'local'
            }
          },
          filterable: true
        },
        editor: {
          presentReferenceListAsTagPicker: true
        }
      },
      myBlockList: {
        type: ContentModelSchemaTypes.list,
        contentType: {
          type: ContentModelSchemaTypes.union,
          cases: {
            caseA: {
              type: ContentModelSchemaTypes.object,
              fields: {
                fieldA: {
                  type: ContentModelSchemaTypes.string
                }
              }
            }
          }
        }
      }
    }
  }
}
