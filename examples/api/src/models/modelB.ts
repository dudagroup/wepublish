import {ContentModel, ContentModelSchemaTypes} from '@dudagroup/api'
import {MODEL_A} from './modelA'
import {typeMediaLibrary} from './modelMediaLibrary'
import {mySharedEnum, mySharedObject, mySharedUnion} from './sharedObject'

export const contentModelB: ContentModel = {
  identifier: 'modelB',
  nameSingular: 'Model B',
  namePlural: 'Models B',
  schema: {
    content: {
      myId: {
        type: ContentModelSchemaTypes.id
      },
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
      myUrlString: {
        type: ContentModelSchemaTypes.string,
        editor: {
          inputType: 'url'
        }
      },
      myStringI18n: {
        type: ContentModelSchemaTypes.string,
        filterable: true,
        searchable: true,
        i18n: true,
        defaultValue: 'custom default value!'
      },
      myMultilineStringI18n: {
        type: ContentModelSchemaTypes.string,
        filterable: true,
        i18n: true,
        editor: {
          inputType: 'textarea',
          inputRows: 5
        }
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
          h1: true,
          h2: true,
          h3: true,
          h4: true,
          h5: true,
          h6: true,
          bold: true,
          italic: true,
          underline: true,
          emoji: true,
          strikethrough: true,
          subscript: true,
          superscript: true,
          table: true,
          unorderedList: true,
          url: true,
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
          h1: true,
          h2: true,
          h3: true,
          h4: true,
          h5: true,
          h6: true,
          bold: true,
          italic: true,
          underline: true,
          emoji: true,
          strikethrough: true,
          subscript: true,
          superscript: true,
          table: true,
          unorderedList: true,
          url: true,
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
      myIntI18n: {
        type: ContentModelSchemaTypes.int,
        filterable: true,
        defaultValue: 333,
        i18n: true
      },
      myFloat: {
        type: ContentModelSchemaTypes.float,
        filterable: true
      },
      myFloatI18n: {
        type: ContentModelSchemaTypes.float,
        filterable: true,
        i18n: true
      },
      myBoolean: {
        type: ContentModelSchemaTypes.boolean,
        defaultValue: true
      },
      myOptionalBoolean: {
        type: ContentModelSchemaTypes.boolean,
        optional: true
      },
      myBooleanI18n: {
        type: ContentModelSchemaTypes.boolean,
        i18n: true
      },
      myDateTime: {
        type: ContentModelSchemaTypes.dateTime,
        filterable: true
      },
      myOptionalDateTime: {
        type: ContentModelSchemaTypes.dateTime,
        optional: true,
        filterable: true
      },
      myDateTimeI18n: {
        type: ContentModelSchemaTypes.dateTime,
        filterable: true,
        i18n: true
      },
      myScharedEnum: mySharedEnum,
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
      myEnumI18n: {
        type: ContentModelSchemaTypes.enum,
        filterable: true,
        i18n: true,
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
      mySharedUnion: mySharedUnion,
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
          },
          caseScharedObject: mySharedObject
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
      myScharedObject: mySharedObject,
      myObject: {
        type: ContentModelSchemaTypes.object,
        fields: {
          myFieldA: {
            type: ContentModelSchemaTypes.string
          },
          myFieldAI18n: {
            type: ContentModelSchemaTypes.string,
            i18n: true
          }
        }
      },
      myOptionalObject: {
        type: ContentModelSchemaTypes.object,
        optional: true,
        fields: {
          myFieldA: {
            type: ContentModelSchemaTypes.string
          },
          myFieldAI18n: {
            type: ContentModelSchemaTypes.string,
            i18n: true
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
            },
            caseB: {
              type: ContentModelSchemaTypes.object,
              fields: {
                fieldB: {
                  type: ContentModelSchemaTypes.string
                }
              }
            }
          }
        }
      },
      myMedia: {
        type: ContentModelSchemaTypes.media
      },
      myMediaI18n: {
        type: ContentModelSchemaTypes.media,
        i18n: true,
        i18nFallbackToDefaultLanguage: true
      }
    }
  }
}
