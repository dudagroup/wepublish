import {
  DBContentAdapter,
  CreateContentArgs,
  Content,
  UpdateContentArgs,
  DeleteContentArgs,
  ConnectionResult,
  GetContentsArgs,
  LimitType,
  InputCursorType,
  SortOrder,
  ContentSort
} from '@wepublish/api'
import {Collection, Db, FilterQuery, MongoCountPreferences} from 'mongodb'
import {CollectionName, DBContent} from './schema'
import {MaxResultsPerPage} from './defaults'
import {Cursor} from './cursor'
import {LanguageConfig} from '@wepublish/api/lib/interfaces/languageConfig'

const PATH_DELIMITER = '__'

function getPublicFilter() {
  const now = new Date()
  return [
    {publicationDate: {$lt: now}},
    {$or: [{dePublicationDate: {$gt: now}}, {dePublicationDate: {$eq: null}}]}
  ]
}

export class MongoDBContentAdapter implements DBContentAdapter {
  private contents: Collection<DBContent>
  private locale: string

  constructor(db: Db, locale: string) {
    this.contents = db.collection(CollectionName.Content)
    this.locale = locale
  }

  async createContent({input}: CreateContentArgs): Promise<Content> {
    const {ops} = await this.contents.insertOne(input)
    return ops[0]
  }

  async updateContent({input}: UpdateContentArgs): Promise<Content> {
    const {value} = await this.contents.findOneAndUpdate(
      {id: input.id},
      [
        {
          $set: input
        }
      ] as any,
      {returnOriginal: false}
    )

    if (!value) {
      throw Error(`Did not find content with id ${input.id}`)
    }
    return value
  }

  async deleteContent({id}: DeleteContentArgs): Promise<boolean> {
    const {deletedCount} = await this.contents.deleteOne({id})
    return deletedCount !== 0
  }

  async getContentByID(id: string, isPublicApi: boolean): Promise<Content | null> {
    const filter: FilterQuery<any> = {$and: [{id}]}
    if (isPublicApi) {
      filter.$and?.push(...getPublicFilter())
    }
    return this.contents.findOne(filter)
  }

  async getContentsByID_(ids: readonly string[]): Promise<Content[]> {
    return this.contents.find({id: {$in: ids as any}}).toArray()
  }

  async getContentsByID(ids: readonly string[], isPublicApi: boolean): Promise<Content[]> {
    const filter: FilterQuery<any> = {$and: [{id: {$in: ids as any}}]}
    if (isPublicApi) {
      filter.$and?.push(...getPublicFilter())
    }

    const articles = await this.contents.find(filter).toArray()
    const articleMap = Object.fromEntries(articles.map(article => [article.id, article]))
    return ids.map(id => articleMap[id] ?? null)
  }

  // TODO: Deduplicate getImages, getPages, getAuthors
  async getContents(
    {filter, sort, order, cursor, limit, type, language}: GetContentsArgs,
    languageConfig: LanguageConfig,
    isPublicApi: boolean
  ): Promise<ConnectionResult<any>> {
    const limitCount = Math.min(limit.count, MaxResultsPerPage)
    const sortDirection = limit.type === LimitType.First ? order : -order

    const cursorData = cursor.type !== InputCursorType.None ? Cursor.from(cursor.data) : undefined

    const expr =
      order === SortOrder.Ascending
        ? cursor.type === InputCursorType.After
          ? '$gt'
          : '$lt'
        : cursor.type === InputCursorType.After
        ? '$lt'
        : '$gt'

    const sortField = contentSortFieldForSort(sort)
    const cursorFilter = cursorData
      ? {
          $or: [
            {[sortField]: {[expr]: cursorData.date}},
            {_id: {[expr]: cursorData.id}, [sortField]: cursorData.date}
          ]
        }
      : {}

    const textFilter: FilterQuery<any> = {}

    function cleanupUserInput(string: string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, ' ')
    }

    let visibilityFilter: FilterQuery<any> = {}
    if (isPublicApi) {
      visibilityFilter = {
        $and: [...getPublicFilter()]
      }
    }

    const genericFilter: FilterQuery<any> = {}
    if (filter) {
      const {title, search, shared, ...genericFilters} = filter
      if (title !== undefined) {
        textFilter.title = {$regex: cleanupUserInput(title), $options: 'i'}
      }
      if (search !== undefined) {
        textFilter.searchIndex = {$regex: cleanupUserInput(search), $options: 'i'}
      }

      if (genericFilters) {
        Object.entries(genericFilters).reduce((accu, item) => {
          const [fieldName, operators] = item
          for (const [operator, value] of Object.entries(operators)) {
            if (value !== undefined) {
              const path = fieldName.split(PATH_DELIMITER)
              if (path[0] === 'i18n') {
                path.shift()
                path.push(language || languageConfig.defaultLanguageTag)
              }
              accu[path.join('.')] = {
                [`$${operator}`]: value
              }
            }
          }
          return accu
        }, genericFilter)
      }
    }

    const typeFilter: FilterQuery<any> = {}
    if (type) {
      typeFilter.contentType = {$eq: type}
    }

    // TODO: Check index usage
    const [totalCount, contents] = await Promise.all([
      this.contents.countDocuments(
        {
          $and: [typeFilter, textFilter, genericFilter, visibilityFilter]
        },
        {collation: {locale: this.locale, strength: 2}} as MongoCountPreferences
      ), // MongoCountPreferences doesn't include collation

      this.contents
        .aggregate([], {collation: {locale: this.locale, strength: 2}})
        .match(visibilityFilter)
        .match(typeFilter)
        .match(textFilter)
        .match(genericFilter)
        .match(cursorFilter)
        .sort({[sortField]: sortDirection, _id: sortDirection})
        .limit(limitCount + 1)
        .toArray()
    ])

    const nodes = contents.slice(0, limitCount)

    if (limit.type === LimitType.Last) {
      nodes.reverse()
    }

    const hasNextPage =
      limit.type === LimitType.First
        ? contents.length > limitCount
        : cursor.type === InputCursorType.Before

    const hasPreviousPage =
      limit.type === LimitType.Last
        ? contents.length > limitCount
        : cursor.type === InputCursorType.After

    const firstContent = nodes[0]
    const lastContent = nodes[nodes.length - 1]

    const startCursor = firstContent
      ? new Cursor(firstContent._id, contentDateForSort(firstContent, sort)).toString()
      : null

    const endCursor = lastContent
      ? new Cursor(lastContent._id, contentDateForSort(lastContent, sort)).toString()
      : null

    return {
      nodes,
      pageInfo: {
        startCursor,
        endCursor,
        hasNextPage,
        hasPreviousPage
      },

      totalCount
    }
  }
}

function contentSortFieldForSort(sort: ContentSort) {
  switch (sort) {
    case ContentSort.CreatedAt:
      return 'createdAt'

    case ContentSort.ModifiedAt:
      return 'modifiedAt'

    case ContentSort.PublishedAt:
      return 'published.publishedAt'

    case ContentSort.UpdatedAt:
      return 'published.updatedAt'

    case ContentSort.PublishAt:
      return 'pending.publishAt'
  }
}

function contentDateForSort(content: DBContent, sort: ContentSort): Date | undefined {
  switch (sort) {
    case ContentSort.CreatedAt:
      return content.createdAt

    case ContentSort.ModifiedAt:
      return content.modifiedAt

    case ContentSort.PublishedAt:
      return '' as any

    case ContentSort.UpdatedAt:
      return '' as any

    case ContentSort.PublishAt:
      return '' as any
  }
}
