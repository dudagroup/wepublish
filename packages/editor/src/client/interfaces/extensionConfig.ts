import {SVGIcon} from 'rsuite/lib/@types/common'
import {IconNames} from 'rsuite/lib/Icon'
import {ContentConfig, Config} from '../api'
import {ContentEditAction} from '../control/contentReducer'
import {DefaultMetadata} from '../panel/contentMetadataPanel'
import {ContentBody} from '../routes/contentEditor'
import {Reference} from './referenceType'

export interface ExtensionBase {
  identifier: string
  icon?: IconNames | SVGIcon
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
  previewPath?: string[]
  previewSize?: 'big' | 'small'
  deriveSlug?: {
    jsonPath: string
    instructions: string
  }
  getMetaView?: getMetaViewFunction<M>
  getContentView?: getContentViewFunction
  getPreviewLink?: getPreviewLinkFunction
}

export type getContentViewFunction = (
  content: any,
  onChange: any,
  disabled: any,
  dispatch: React.Dispatch<ContentEditAction>,
  configs: Configs,
  contentModelConfigMerged: ContentModelConfigMerged,
  langLaneL: string,
  langLaneR: string
) => JSX.Element

export type getPreviewLinkFunction = (token: string, recordData: ContentBody) => string

export type getMetaViewFunction<M = any> = (
  metadata: DefaultMetadata,
  customMetadata: M,
  onChangeMetaData: (defaultMetadata: DefaultMetadata) => void,
  onChangeCustomMetaData: (customMetadata: M) => void,
  dispatchCustomMetaData: React.Dispatch<ContentEditAction>,
  configs: Configs,
  contentModelConfigMerged: ContentModelConfigMerged,
  langLaneL: string,
  langLaneR: string
) => JSX.Element

export type ContentModelConfigMerged = ContentConfig & Partial<ContentModelExtension>
export interface Configs {
  apiConfig: Config
  editorConfig: EditorConfig
  contentModelExtensionMerged: ContentModelConfigMerged[]
}
