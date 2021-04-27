import {Context} from '../context'
import {Content, DBContentState} from '../db/content'
import nanoid from 'nanoid/generate'
import {
  authorise,
  CanCreateContent,
  CanDeleteContent,
  CanPublishContent
} from '../graphql/permissions'
import {
  ContentModelSchema,
  ContentModelSchemaFieldLeaf,
  ContentModelSchemas,
  ContentModelSchemaTypes
} from '../interfaces/contentModelSchema'
import {MapType} from '../interfaces/utilTypes'
import {destructUnionCase} from '../utility'
import {LanguageConfig} from '../interfaces/languageConfig'
import {validateInput, ValidatorContext} from './contentModelBusinessInputValidation'

export function generateID() {
  return nanoid('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 16)
}

export class BusinessLogic {
  private context: Omit<Context, 'business'>

  constructor(context: Omit<Context, 'business'>) {
    this.context = context
  }

  async createContent(identifier: string, input: Content) {
    const {roles} = this.context.authenticate()
    authorise(CanCreateContent, roles)

    const schema = this.context.contentModels?.find(item => item.identifier === identifier)
    if (!schema) {
      throw Error(`Schema ${identifier} not found`)
    }
    const validatorContext: ValidatorContext = {context: this.context, searchTerms: {}}
    await validateInput(validatorContext, schema.schema.content, input.content)
    await validateInput(validatorContext, schema.schema.meta, input.meta)

    return this.context.dbAdapter.content.createContent({
      input: {
        ...input,
        id: generateID(),
        contentType: identifier,
        revision: 1,
        state: DBContentState.Draft,
        createdAt: new Date(),
        modifiedAt: new Date(),
        publicationDate: undefined,
        dePublicationDate: undefined,
        searchIndex: validatorContext.searchTerms
      }
    })
  }

  async updateContent(identifier: string, input: Content) {
    const {roles} = this.context.authenticate()
    authorise(CanCreateContent, roles)

    const schema = this.context.contentModels?.find(item => item.identifier === identifier)
    if (!schema) {
      throw Error(`Schema ${identifier} not found`)
    }
    const validatorContext: ValidatorContext = {context: this.context, searchTerms: {}}
    await validateInput(validatorContext, schema.schema.content, input.content)
    await validateInput(validatorContext, schema.schema.meta, input.meta)

    return this.context.dbAdapter.content.updateContent({
      input: {
        ...input,
        contentType: identifier,
        revision: 1,
        state: DBContentState.Draft,
        modifiedAt: new Date(),
        searchIndex: validatorContext.searchTerms
      }
    })
  }

  async deleteContent(id: string) {
    const {roles} = this.context.authenticate()
    authorise(CanDeleteContent, roles)
    return this.context.dbAdapter.content.deleteContent({id})
  }

  async publishContent(
    id: string,
    revision: number,
    publishAt: Date,
    publishedAt: Date,
    updatedAt?: Date
  ) {
    const {roles} = this.context.authenticate()
    authorise(CanPublishContent, roles)

    return this.context.dbAdapter.content.updateContent({
      input: {
        id,
        revision,
        state: DBContentState.Release,
        modifiedAt: updatedAt || new Date(),
        publicationDate: publishAt || new Date()
      }
    })
  }

  async unpublishContent(id: string, revision: number) {
    const {roles} = this.context.authenticate()
    authorise(CanPublishContent, roles)

    return this.context.dbAdapter.content.updateContent({
      input: {
        id,
        revision,
        state: DBContentState.Draft,
        modifiedAt: new Date()
      }
    })
  }
}

interface flattenI18nLeafFieldsContext {
  languageId: string
}

function flattenI18nLeafFields(
  validatorContext: flattenI18nLeafFieldsContext,
  schema: ContentModelSchemas,
  data: any
) {
  switch (schema.type) {
    case ContentModelSchemaTypes.object: {
      const obj = data as MapType<any>
      for (const [key, val] of Object.entries(obj)) {
        obj[key] = flattenI18nLeafFields(validatorContext, schema.fields[key], val)
      }
      break
    }

    case ContentModelSchemaTypes.list: {
      const list = data as unknown[]
      for (const i in list) {
        list[i] = flattenI18nLeafFields(validatorContext, schema.contentType, list[i])
      }
      break
    }

    case ContentModelSchemaTypes.union: {
      const union = data as MapType<any>
      const {unionCase, val} = destructUnionCase(union)
      union[unionCase] = flattenI18nLeafFields(validatorContext, schema.cases[unionCase], val)
      break
    }

    default:
      if ((schema as ContentModelSchemaFieldLeaf).i18n) {
        return data[validatorContext.languageId]
      }
      return data
  }
}

function flattenI18nLeafFieldsOnRecord(
  validatorContext: flattenI18nLeafFieldsContext,
  modelSchema: ContentModelSchema,
  record: any
) {
  flattenI18nLeafFields(
    validatorContext,
    {
      type: ContentModelSchemaTypes.object,
      fields: modelSchema.content
    },
    record?.content
  )
  if (modelSchema.meta) {
    flattenI18nLeafFields(
      validatorContext,
      {
        type: ContentModelSchemaTypes.object,
        fields: modelSchema.meta
      },
      record?.meta
    )
  }
}

export function flattenI18nLeafFieldsMap(
  languageConfig: LanguageConfig,
  modelSchema: ContentModelSchema,
  language: string
) {
  const currentLang = languageConfig.languages.find(l => l.tag === language)
  let languageId: string
  if (currentLang) {
    languageId = currentLang.tag // TODO switch to id
  } else {
    languageId = 'en' // languageConfig.defaultLanguageTag
  }
  return (record: any) => {
    return flattenI18nLeafFieldsOnRecord({languageId}, modelSchema, record)
  }
}
