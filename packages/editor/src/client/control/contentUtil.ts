import {LanguagesConfig} from '../api'
import {
  ContentModelSchemaFieldBase,
  ContentModelSchemaFieldEnum,
  ContentModelSchemaFieldLeaf,
  ContentModelSchemaFieldObject,
  ContentModelSchemaFieldUnion,
  ContentModelSchemaTypes
} from '../interfaces/contentModelSchema'
import {MapType} from '../interfaces/utilTypes'

export function generateEmptyContent(
  field: ContentModelSchemaFieldBase,
  languagesConfig: LanguagesConfig
): unknown {
  function defaultVal(defaultValue: unknown) {
    const schema = field as ContentModelSchemaFieldLeaf
    defaultValue = (schema as ContentModelSchemaFieldEnum).defaultValue || defaultValue
    if (schema.i18n) {
      return languagesConfig?.languages.reduce((accu, lang) => {
        accu[lang.tag] = defaultValue
        return accu
      }, {} as MapType<unknown>)
    }
    return defaultValue
  }

  if (!field) {
    return undefined
  }
  if (field.type === ContentModelSchemaTypes.object) {
    const schema = field as ContentModelSchemaFieldObject
    if (!schema.fields) {
      return undefined
    }
    const r: {[key: string]: unknown} = {}
    return Object.entries(schema.fields).reduce((accu, item) => {
      const [key, val] = item
      accu[key] = generateEmptyContent(val, languagesConfig)
      return accu
    }, r)
  }
  if (field.type === ContentModelSchemaTypes.id) {
    return defaultVal('')
  }
  if (field.type === ContentModelSchemaTypes.string) {
    return defaultVal('')
  }
  if (field.type === ContentModelSchemaTypes.richText) {
    return defaultVal([
      {
        type: 'paragraph',
        children: [
          {
            text: ''
          }
        ]
      }
    ])
  }
  if (field.type === ContentModelSchemaTypes.enum) {
    const schema = field as ContentModelSchemaFieldEnum
    return defaultVal(schema.values[0].value)
  }
  if (field.type === ContentModelSchemaTypes.int) {
    return defaultVal(0)
  }
  if (field.type === ContentModelSchemaTypes.float) {
    return defaultVal(0)
  }
  if (field.type === ContentModelSchemaTypes.boolean) {
    return defaultVal(true)
  }
  if (field.type === ContentModelSchemaTypes.dateTime) {
    return defaultVal(new Date().toISOString())
  }
  if (field.type === ContentModelSchemaTypes.list) {
    return []
  }
  if (field.type === ContentModelSchemaTypes.reference) {
    return defaultVal(null)
  }
  if (field.type === ContentModelSchemaTypes.media) {
    return defaultVal(null)
  }
  if (field.type === ContentModelSchemaTypes.union) {
    const schema = field as ContentModelSchemaFieldUnion
    const [key, val] = Object.entries(schema.cases)[0]
    return {[key]: generateEmptyContent(val, languagesConfig)}
  }

  return {}
}

export function generateEmptyRootContent(schema: unknown, lang: LanguagesConfig): unknown {
  return generateEmptyContent(
    {
      type: ContentModelSchemaTypes.object,
      fields: schema
    } as any,
    lang
  )
}
