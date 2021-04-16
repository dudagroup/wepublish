import {ContentConfig, Config} from '../api'
import {DefaultMetadata} from '../panel/contentMetadataPanel'

export interface ExtensionBase {
  identifier: string
}

export interface CusomExtension extends ExtensionBase {
  nameSingular: string
  namePlural: string
  view: any
}

export interface NavigationBarConfig {
  articlesActive: boolean
  pagesActive: boolean
  imageLibraryActive: boolean
  authorsActive: boolean
  commentsActive: boolean
  navigationActive: boolean
}

export interface EditorConfig {
  contentModelExtension?: ContentModelExtension[]
  cusomExtension?: CusomExtension[]
  navigationBar?: NavigationBarConfig
}

export interface ContentModelExtension<M = any> extends ExtensionBase {
  defaultContent?: any
  defaultMeta?: any
  getMetaView?: (
    metadata: DefaultMetadata,
    customMetadata: M,
    onChangeMetaData: (defaultMetadata: DefaultMetadata) => void,
    onChangeCustomMetaData: (customMetadata: M) => void
  ) => any
  getContentView?: (content: any, onChange: any, disabled: any) => any
}

export type ContentModelConfigMerged = ContentConfig & Partial<ContentModelExtension>
export interface Configs {
  apiConfig: Config
  editorConfig: EditorConfig
  contentModelExtensionMerged: ContentModelConfigMerged[]
}
