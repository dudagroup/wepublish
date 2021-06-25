import {LanguagesConfig} from '../api'
import {
  ContentModelSchemaFieldBase,
  ContentModelSchemaFieldBoolean,
  ContentModelSchemaFieldDate,
  ContentModelSchemaFieldEnum,
  ContentModelSchemaFieldFloat,
  ContentModelSchemaFieldId,
  ContentModelSchemaFieldInt,
  ContentModelSchemaFieldLeaf,
  ContentModelSchemaFieldObject,
  ContentModelSchemaFieldRichText,
  ContentModelSchemaFieldString,
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
    const schema = field as ContentModelSchemaFieldId
    if (schema.optional) {
      return defaultVal(null)
    }
    return defaultVal(schema.defaultValue || '')
  }
  if (field.type === ContentModelSchemaTypes.string) {
    const schema = field as ContentModelSchemaFieldString
    if (schema.optional) {
      return defaultVal(null)
    }
    return defaultVal(schema.defaultValue || '')
  }
  if (field.type === ContentModelSchemaTypes.richText) {
    const schema = field as ContentModelSchemaFieldRichText
    if (schema.optional) {
      return defaultVal(null)
    }
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
    if (schema.optional) {
      return defaultVal(null)
    }
    return defaultVal(schema.defaultValue || schema.values[0].value)
  }
  if (field.type === ContentModelSchemaTypes.int) {
    const schema = field as ContentModelSchemaFieldInt
    if (schema.optional) {
      return defaultVal(null)
    }
    return defaultVal(schema.defaultValue || 0)
  }
  if (field.type === ContentModelSchemaTypes.float) {
    const schema = field as ContentModelSchemaFieldFloat
    if (schema.optional) {
      return defaultVal(null)
    }
    return defaultVal(schema.defaultValue || 0)
  }
  if (field.type === ContentModelSchemaTypes.boolean) {
    const schema = field as ContentModelSchemaFieldBoolean
    if (schema.optional) {
      return defaultVal(null)
    }
    return defaultVal(schema.defaultValue || false)
  }
  if (field.type === ContentModelSchemaTypes.dateTime) {
    const schema = field as ContentModelSchemaFieldDate
    if (schema.optional) {
      return defaultVal(null)
    }
    return defaultVal(schema.defaultValue || new Date().toISOString())
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
    if (schema.optional) {
      return defaultVal(null)
    }
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
