import {
  ContentModelSchemaFieldEnum,
  ContentModelSchemaFieldObject,
  ContentModelSchemaFieldUnion,
  ContentModelSchemaTypes
} from '../../../../packages/api/lib'

export const mySharedObject: ContentModelSchemaFieldObject = {
  type: ContentModelSchemaTypes.object,
  name: 'mySharedObject',
  nameInput: 'mySharedObjectInput',
  fields: {
    myFieldA: {
      type: ContentModelSchemaTypes.string
    },
    myFieldAI18n: {
      type: ContentModelSchemaTypes.string,
      i18n: true
    }
  }
}

export const mySharedEnum: ContentModelSchemaFieldEnum = {
  type: ContentModelSchemaTypes.enum,
  name: 'mySharedEnum',
  nameInput: 'mySharedEnumInput',
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
}

export const mySharedUnion: ContentModelSchemaFieldUnion = {
  type: ContentModelSchemaTypes.union,
  name: 'mySharedUnion',
  nameInput: 'mySharedUnionInput',
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
    caseShared: mySharedObject
  }
}
