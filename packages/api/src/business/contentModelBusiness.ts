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
  ContentModelSchemaFieldRef,
  ContentModelSchemas,
  ContentModelSchemaTypes
} from '../interfaces/contentModelSchema'
import {MapType} from '../interfaces/utilTypes'
import {Reference} from '../interfaces/referenceType'
import {MediaInput, MediaPersisted} from '../interfaces/mediaType'
import {destructUnionCase} from '../utility'
import {LanguageConfig} from '../interfaces/languageConfig'

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
    await validateInput({context: this.context}, schema.schema.content, input.content)
    await validateInput({context: this.context}, schema.schema.meta, input.meta)

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
        dePublicationDate: undefined
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
    await validateInput({context: this.context}, schema.schema.content, input.content)
    await validateInput({context: this.context}, schema.schema.meta, input.meta)

    return this.context.dbAdapter.content.updateContent({
      input: {
        ...input,
        contentType: identifier,
        revision: 1,
        state: DBContentState.Draft,
        modifiedAt: new Date()
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

interface ValidatorContext {
  context: Omit<Context, 'business'>
}
async function validateInput(
  validatorContext: ValidatorContext,
  schema?: MapType<ContentModelSchemas>,
  data?: MapType<any>
) {
  if (!(data && schema)) return
  for (const [key, val] of Object.entries(schema)) {
    await validateRecursive(validatorContext, val, data[key])
  }
}

async function validateRecursive(
  validatorContext: ValidatorContext,
  schema: ContentModelSchemas,
  data: unknown
) {
  async function handleRef(data: unknown, schema: ContentModelSchemaFieldRef) {
    const ref = data as Reference
    if (ref?.recordId) {
      let record
      try {
        const content = await validatorContext.context.loaders.content.load(ref.recordId)
        if (Object.keys(schema.types).some(type => type === content?.contentType)) {
          record = content
        }
      } catch (error) {}
      if (!record) {
        throw new Error(`Reference of type ${ref.contentType} and id ${ref.recordId} not valid`)
      }

      delete ref.record
      delete ref.peer
    }
  }

  async function handleMedia(data: unknown) {
    const mediaInput = data as MediaInput
    const mediaDb = data as MediaPersisted

    if (mediaInput?.file) {
      const image = await validatorContext.context.mediaAdapter.uploadImage(mediaInput.file)
      mediaDb.id = image.id
      mediaDb.createdAt = new Date()
      mediaDb.modifiedAt = new Date()
      mediaDb.filename = image.filename
      mediaDb.fileSize = image.fileSize
      mediaDb.extension = image.extension
      mediaDb.mimeType = image.mimeType
      if (image.format && image.width && image.height) {
        mediaDb.image = {
          format: image.format,
          height: image.width,
          width: image.height
        }
      } else {
        mediaDb.image = null
      }

      delete mediaInput.file
      delete mediaInput.media
    }
  }

  switch (schema.type) {
    case ContentModelSchemaTypes.object: {
      const obj = data as MapType<any>
      for (const [key, val] of Object.entries(obj)) {
        await validateRecursive(validatorContext, schema.fields[key], val)
      }
      break
    }

    case ContentModelSchemaTypes.list: {
      const list = data as unknown[]
      for (const item of list) {
        await validateRecursive(validatorContext, schema.contentType, item)
      }
      break
    }

    case ContentModelSchemaTypes.union: {
      const union = data as MapType<any>
      const {unionCase, val} = destructUnionCase(union)
      await validateRecursive(validatorContext, schema.cases[unionCase], val)
      break
    }

    case ContentModelSchemaTypes.reference: {
      if (schema.i18n) {
        for (const val of Object.values(data as any)) {
          await handleRef(val, schema)
        }
        break
      }
      await handleRef(data, schema)
      break
    }

    case ContentModelSchemaTypes.media: {
      if (schema.i18n) {
        for (const val of Object.values(data as any)) {
          await handleMedia(val)
        }
        break
      }
      await handleMedia(data)
      break
    }

    default:
      break
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
    languageId = 'en' // languageConfig.defaultLanguageId
  }
  return (record: any) => {
    return flattenI18nLeafFieldsOnRecord({languageId}, modelSchema, record)
  }
}
