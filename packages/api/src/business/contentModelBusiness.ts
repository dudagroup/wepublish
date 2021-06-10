import {Context} from '../context'
import {Content} from '../db/content'
import nanoid from 'nanoid/generate'
import {
  authorise,
  CanCreateContent,
  CanDeleteContent,
  CanPublishContent
} from '../graphql/permissions'
import {
  ContentModelSchema,
  ContentModelSchemaFieldObject,
  ContentModelSchemaFieldString,
  ContentModelSchemas,
  ContentModelSchemaTypes
} from '../interfaces/contentModelSchema'
import {MapType} from '../interfaces/utilTypes'
import {destructUnionCase} from '../utility'
import {LanguageConfig} from '../interfaces/languageConfig'
import {validateInput, ValidatorContext} from './contentModelBusinessInputValidation'
import {generateEmptyContent} from './contentUtil'

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
    const validatorContext: ValidatorContext = {
      context: this.context,
      searchTermsI18n: {},
      searchTerms: ''
    }
    await validateInput(validatorContext, schema.schema.content, input.content)
    await validateInput(validatorContext, schema.schema.meta, input.meta)

    return this.context.dbAdapter.content.createContent({
      input: {
        ...input,
        id: generateID(),
        contentType: identifier,
        createdAt: new Date(),
        modifiedAt: new Date(),
        publicationDate: undefined,
        dePublicationDate: undefined,
        searchIndexI18n: validatorContext.searchTermsI18n,
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

    const persistentData = await this.context.dbAdapter.content.getContentByID(input.id)
    const validatorContext: ValidatorContext = {
      context: this.context,
      searchTermsI18n: {},
      searchTerms: ''
    }
    await validateInput(
      validatorContext,
      schema.schema.content,
      input.content,
      persistentData?.content
    )
    await validateInput(validatorContext, schema.schema.meta, input.meta, persistentData?.meta)

    return this.context.dbAdapter.content.updateContent({
      input: {
        ...input,
        contentType: identifier,
        modifiedAt: new Date(),
        searchIndexI18n: validatorContext.searchTermsI18n,
        searchIndex: validatorContext.searchTerms
      }
    })
  }

  async deleteContent(id: string) {
    const {roles} = this.context.authenticate()
    authorise(CanDeleteContent, roles)
    return this.context.dbAdapter.content.deleteContent({id})
  }

  async publishContent(id: string, publicationDate: Date, depublicationDate: Date) {
    const {roles} = this.context.authenticate()
    authorise(CanPublishContent, roles)

    return this.context.dbAdapter.content.updateContent({
      input: {
        id,
        publicationDate: publicationDate || new Date(),
        dePublicationDate: depublicationDate || undefined,
        modifiedAt: new Date()
      }
    })
  }

  async unpublishContent(id: string) {
    const {roles} = this.context.authenticate()
    authorise(CanPublishContent, roles)

    return this.context.dbAdapter.content.updateContent({
      input: {
        id,
        modifiedAt: new Date(),
        publicationDate: undefined
      }
    })
  }
}

interface flattenI18nLeafFieldsContext {
  languageTag: string
}

function flattenI18nLeafFields(
  validatorContext: flattenI18nLeafFieldsContext,
  schema: ContentModelSchemas,
  data: any
) {
  switch (schema.type) {
    case ContentModelSchemaTypes.object: {
      if (!(data && typeof data === 'object')) {
        if (schema.optional) {
          return null
        }
        data = {}
      }
      const schemaObject = schema as ContentModelSchemaFieldObject
      const obj = data as MapType<any>
      for (const [key, model] of Object.entries(schemaObject.fields)) {
        obj[key] = flattenI18nLeafFields(validatorContext, model, obj?.[key])
      }
      return obj
    }

    case ContentModelSchemaTypes.list: {
      if (!data) {
        data = []
      }
      const list = data as unknown[]
      for (const i in list) {
        list[i] = flattenI18nLeafFields(validatorContext, schema.contentType, list[i])
      }
      return list
    }

    case ContentModelSchemaTypes.union: {
      if (!data) {
        data = generateEmptyContent(schema, {
          defaultLanguageTag: validatorContext.languageTag,
          languages: [
            {
              tag: validatorContext.languageTag,
              description: ''
            }
          ]
        })
      }
      const union = data as MapType<any>
      const {unionCase, val} = destructUnionCase(union)
      if (unionCase) {
        union[unionCase] = flattenI18nLeafFields(validatorContext, schema.cases[unionCase], val)
      }
      return union
    }

    default: {
      const schemaLeaf = schema as ContentModelSchemaFieldString
      if (schemaLeaf.i18n) {
        if (data && validatorContext.languageTag in data) {
          if (
            schemaLeaf.optional ||
            (data[validatorContext.languageTag] !== null &&
              data[validatorContext.languageTag] !== undefined)
          ) {
            return data[validatorContext.languageTag]
          }
        }

        const emptyData: any = generateEmptyContent(schemaLeaf, {
          defaultLanguageTag: validatorContext.languageTag,
          languages: [
            {
              tag: validatorContext.languageTag,
              description: ''
            }
          ]
        })
        return emptyData[validatorContext.languageTag]
      }

      if (schemaLeaf.optional || (data !== null && data !== undefined)) {
        return data
      }
      const emptyData: any = generateEmptyContent(schemaLeaf, {
        defaultLanguageTag: validatorContext.languageTag,
        languages: [
          {
            tag: validatorContext.languageTag,
            description: ''
          }
        ]
      })
      return emptyData
    }
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
  language?: string
) {
  const currentLang = languageConfig.languages.find(l => l.tag === language)
  let languageTag: string
  if (currentLang) {
    languageTag = currentLang.tag
  } else {
    languageTag = languageConfig.defaultLanguageTag
  }
  return (record: any) => {
    return flattenI18nLeafFieldsOnRecord({languageTag}, modelSchema, record)
  }
}
