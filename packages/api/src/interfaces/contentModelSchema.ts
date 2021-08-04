import {MapType} from './utilTypes'

export interface I18n<T = string> {
  [language: string]: T
}

export interface ContentModelSchemaFieldBase {
  type: ContentModelSchemaTypes
  /**
   * instruction returned for the graphql description field
   */
  instructions?: string
  /**
   * some options which only do have an effect for the editor but not the api
   */
  editor?: {
    /**
     * displayed alternative label for this field
     */
    name?: I18n<string> | string
    /**
     * instructions displayed in the editor
     */
    instructions?: I18n<string> | string
  }
  /**
   * whether this field is visible on the public api
   */
  public?: boolean
  /**
   * graphql field can be null
   */
  optional?: boolean
  /**
   * marks the graphql field as deprecated
   */
  deprecationReason?: string
}

export interface ContentModelSchemaFieldLeaf extends ContentModelSchemaFieldBase {
  /**
   * determines if the field is multilanguage capable.
   */
  i18n?: boolean
  /**
   * if true, the public api returns content of the default language if there is no content for the desired language set
   */
  i18nFallbackToDefaultLanguage?: boolean
  /**
   * if true, the api provides filter and sort params for this field
   */
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
  /**
   * value used if a new record is created. The api also returns this value for records who do not have a value set eg. after adding a new field to a model.
   */
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
  value?: string
  description?: string
}

export interface ContentModelSchemaFieldEnum extends ContentModelSchemaFieldLeaf {
  type: ContentModelSchemaTypes.enum
  /**
   * name is optional but must be unique. If a name is set, the enum can be used in different models
   */
  name?: string
  /**
   * name is optional but must be unique. If a name is set, the object can be used in different models
   */
  nameInput?: string
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
  h4?: boolean
  h5?: boolean
  h6?: boolean
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
  /**
   * type definition of the list element
   */
  contentType: ContentModelSchemas
  editor?: {
    name?: I18n<string> | string
    instructions?: I18n<string> | string
    presentReferenceListAsTagPicker?: boolean
  }
}

export interface ContentModelSchemaFieldObject extends ContentModelSchemaFieldBase {
  type: ContentModelSchemaTypes.object
  /**
   * name is optional but must be unique. If a name is set, the object can be used in different models
   */
  name?: string
  /**
   * name is optional but must be unique. If a name is set, the object can be used in different models
   */
  nameInput?: string
  /**
   * object fields. At least one field needs to be defined
   */
  fields: MapType<ContentModelSchemas>
}

export interface ContentModelSchemaFieldUnion extends ContentModelSchemaFieldBase {
  type: ContentModelSchemaTypes.union
  /**
   * name is optional but must be unique. If a name is set, the union can be used in different models
   */
  name?: string
  /**
   * name is optional but must be unique. If a name is set, the object can be used in different models
   */
  nameInput?: string
  /**
   * union cases. At least one case needs to be defined
   */
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
