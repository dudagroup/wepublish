import {LanguageConfig} from '../interfaces/languageConfig'
import {MapType} from '../interfaces/utilTypes'
import {SortOrder, Limit, InputCursor, ConnectionResult} from './common'

export interface Content<T = any> {
  id: string
  contentType: string

  createdAt: Date
  modifiedAt: Date

  publicationDate?: Date
  dePublicationDate?: Date

  shared: boolean
  title: string
  slugI18n?: MapType<string>

  searchIndex?: MapType<string>

  content: T
  meta: T
}

export type OptionalContent = Content | null

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

type ContentUpdate = PartialBy<
  Omit<Content, 'createdAt'>,
  'shared' | 'title' | 'content' | 'meta' | 'contentType'
>

export interface CreateContentArgs {
  readonly input: Content
}

export interface UpdateContentArgs {
  readonly input: ContentUpdate
}

export interface DeleteContentArgs {
  readonly id: string
  readonly revision?: number
}

export interface PublicContent extends Content {
  readonly id: string

  readonly revision: number
  readonly shared: boolean

  readonly createdAt: Date
  readonly publishAt?: Date
  readonly updatedAt?: Date
  readonly publishedAt?: Date

  readonly content: any
  readonly meta: any
}

export interface ContentFilter {
  readonly title?: string
  readonly search?: string
  readonly shared?: boolean
  [key: string]: any
}

export interface PublicContentFilter {
  readonly authors?: string[]
  readonly tags?: string[]
}

export enum ContentSort {
  CreatedAt = 'createdAt',
  ModifiedAt = 'modifiedAt',
  PublishedAt = 'publishedAt',
  UpdatedAt = 'updatedAt',
  PublishAt = 'publishAt'
}

export interface GetContentsArgs {
  readonly cursor: InputCursor
  readonly limit: Limit
  readonly filter?: ContentFilter
  readonly sort: ContentSort
  readonly order: SortOrder
  readonly type?: string
  readonly language?: string
}

export interface GetPublishedContentsArgs {
  readonly cursor: InputCursor
  readonly limit: Limit
  readonly filter?: PublicContentFilter
  readonly sort: ContentSort
  readonly order: SortOrder
  readonly type?: string
}

export interface DBContentAdapter {
  createContent(args: CreateContentArgs): Promise<Content>
  updateContent(args: UpdateContentArgs): Promise<Content>
  deleteContent(args: DeleteContentArgs): Promise<boolean>

  getContentByID(id: string, isPublicApi?: boolean): Promise<Content | null>
  getContentsByID(ids: readonly string[], isPublicApi?: boolean): Promise<OptionalContent[]>

  getContents(
    args: GetContentsArgs,
    languageConfig: LanguageConfig,
    isPublicApi?: boolean
  ): Promise<ConnectionResult<Content>>
}
