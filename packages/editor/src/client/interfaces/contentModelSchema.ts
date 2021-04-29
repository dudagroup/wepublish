import {MapType} from './utilTypes'

export interface I18n<T = string> {
  [language: string]: T
}

export interface ContentModelSchemaFieldBase {
  type: ContentModelSchemaTypes
  instructions?: string
  editor?: {
    name?: I18n<string> | string
    instructions?: I18n<string> | string
  }
  public?: boolean
  optional?: boolean
  deprecationReason?: string
}

export interface ContentModelSchemaFieldLeaf extends ContentModelSchemaFieldBase {
  i18n?: boolean
  filterable?: boolean
}

export enum ContentModelSchemaTypes {
  id = 'id',
  string = 'string',
  boolean = 'boolean',
  int = 'int',
  float = 'float',
  enum = 'enum',
  dateTime = 'dateTime',
  media = 'media',
  richText = 'richText',
  reference = 'reference',
  list = 'list',
  object = 'object',
  union = 'union'
}
export interface ContentModelSchemaFieldId extends ContentModelSchemaFieldLeaf {
  type: ContentModelSchemaTypes.id
  defaultValue?: string
}

export interface ContentModelSchemaFieldString extends ContentModelSchemaFieldLeaf {
  type: ContentModelSchemaTypes.string
  defaultValue?: string
  editor?: {
    name?: I18n<string> | string
    instructions?: I18n<string> | string
    maxCharacters?: number
    inputType?: 'text' | 'url' | 'tel' | 'email' | 'password' | 'textarea'
    inputRows?: number
    placeholder?: string
  }
  searchable?: boolean
}

export interface ContentModelSchemaFieldBoolean extends ContentModelSchemaFieldLeaf {
  type: ContentModelSchemaTypes.boolean
  defaultValue?: boolean
}

export interface ContentModelSchemaFieldInt extends ContentModelSchemaFieldLeaf {
  type: ContentModelSchemaTypes.int
  defaultValue?: number
}
export interface ContentModelSchemaFieldFloat extends ContentModelSchemaFieldLeaf {
  type: ContentModelSchemaTypes.float
  defaultValue?: number
}

export type ContentModelSchemaFieldEnumValueConfigMap = {
  [key: string]: ContentModelSchemaFieldEnumValueConfig
}

export interface ContentModelSchemaFieldEnumValueConfig {
  description?: string
  value?: string
}

export interface ContentModelSchemaFieldEnum extends ContentModelSchemaFieldLeaf {
  type: ContentModelSchemaTypes.enum
  values: ContentModelSchemaFieldEnumValueConfig[]
  defaultValue?: number
}

export interface ContentModelSchemaFieldDate extends ContentModelSchemaFieldLeaf {
  type: ContentModelSchemaTypes.dateTime
  defaultValue?: Date
}

export interface RichTextConfig {
  h1?: boolean
  h2?: boolean
  h3?: boolean
  italic?: boolean
  bold?: boolean
  underline?: boolean
  strikethrough?: boolean
  superscript?: boolean
  subscript?: boolean
  table?: boolean
  emoji?: boolean
  unorderedList?: boolean
  orderedList?: boolean
  url?: boolean
  ref?: ContentModelSchemaFieldRefTypeMap
}

export interface ContentModelSchemaFieldRichText extends ContentModelSchemaFieldBase {
  type: ContentModelSchemaTypes.richText
  config?: RichTextConfig
  i18n?: boolean
  searchable?: boolean
}

export interface ContentModelSchemaFieldMedia extends ContentModelSchemaFieldLeaf {
  type: ContentModelSchemaTypes.media
}

export type ReferenceScope = 'local' | 'peers' | 'all'

export interface ContentModelSchemaFieldRefTypeMap {
  [contentType: string]: {
    scope: ReferenceScope
  }
}

export interface ContentModelSchemaFieldRef extends ContentModelSchemaFieldLeaf {
  type: ContentModelSchemaTypes.reference
  types: ContentModelSchemaFieldRefTypeMap
}

export interface ContentModelSchemaFieldList extends ContentModelSchemaFieldBase {
  type: ContentModelSchemaTypes.list
  contentType: ContentModelSchemas
}

export interface ContentModelSchemaFieldObject extends ContentModelSchemaFieldBase {
  type: ContentModelSchemaTypes.object
  fields: MapType<ContentModelSchemas>
}

export interface ContentModelSchemaFieldUnion extends ContentModelSchemaFieldBase {
  type: ContentModelSchemaTypes.union
  cases: MapType<ContentModelSchemaFieldObject>
}

export type ContentModelSchemas =
  | ContentModelSchemaFieldId
  | ContentModelSchemaFieldString
  | ContentModelSchemaFieldInt
  | ContentModelSchemaFieldFloat
  | ContentModelSchemaFieldBoolean
  | ContentModelSchemaFieldDate
  | ContentModelSchemaFieldRichText
  | ContentModelSchemaFieldMedia
  | ContentModelSchemaFieldRef
  | ContentModelSchemaFieldEnum
  | ContentModelSchemaFieldList
  | ContentModelSchemaFieldObject
  | ContentModelSchemaFieldUnion

export interface ContentModelSchema {
  content: MapType<ContentModelSchemas>
  meta?: MapType<ContentModelSchemas>
}
