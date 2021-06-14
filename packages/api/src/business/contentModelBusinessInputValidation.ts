import {Context} from '../context'
import {
  ContentModelSchemaFieldRefTypeMap,
  ContentModelSchemaFieldRichText,
  ContentModelSchemas,
  ContentModelSchemaTypes
} from '../interfaces/contentModelSchema'
import {MapType} from '../interfaces/utilTypes'
import {Reference} from '../interfaces/referenceType'
import {MediaInput, MediaPersisted} from '../interfaces/mediaType'
import {destructUnionCase} from '../utility'
import {
  ElementNodeType,
  RichTextAbstractNode,
  RichTextNode,
  RichTextReferenceNode,
  RichTextTextNode
} from '../graphql/richText'

export interface ValidatorContext {
  context: Omit<Context, 'business'>
  searchTermsI18n: MapType<string>
  searchTerms: string
}

async function validateRecursive(
  validatorContext: ValidatorContext,
  schema: ContentModelSchemas,
  data: any,
  persistentData?: any
) {
  async function handleRef(
    data: unknown,
    contentModelSchemaFieldRefTypeMap: ContentModelSchemaFieldRefTypeMap
  ) {
    const ref = data as Reference
    if (ref?.recordId) {
      let record
      try {
        const content = await validatorContext.context.loaders.content.load(ref.recordId)
        if (
          Object.keys(contentModelSchemaFieldRefTypeMap).some(type => type === content?.contentType)
        ) {
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

  async function handleMedia(data: unknown, persistentData?: MediaPersisted) {
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
          height: image.height,
          width: image.width
        }
      } else {
        mediaDb.image = null
      }

      delete mediaInput.file
      delete mediaInput.media
      return mediaDb
    } else if (mediaDb && persistentData?.id) {
      mediaDb.id = persistentData.id
      mediaDb.createdAt = persistentData.createdAt
      mediaDb.modifiedAt = persistentData.modifiedAt
      mediaDb.filename = persistentData.filename
      mediaDb.fileSize = persistentData.fileSize
      mediaDb.extension = persistentData.extension
      mediaDb.mimeType = persistentData.mimeType
      mediaDb.image = persistentData.image
      return mediaDb
    }
    return null
  }

  async function validateRichTextRecursive(
    lang: string,
    isI18n: boolean,
    searchable: boolean | undefined,
    richTextNode: RichTextNode | RichTextAbstractNode
  ) {
    const richTextAbstractNode = richTextNode as RichTextAbstractNode
    if (richTextAbstractNode.children?.length > 0) {
      const richTextReferenceNode = richTextNode as RichTextAbstractNode
      for (const child of richTextReferenceNode.children) {
        await validateRichTextRecursive(lang, isI18n, searchable, child)
      }
    }

    if ((richTextNode as RichTextTextNode).text && searchable) {
      if (isI18n) {
        validatorContext.searchTermsI18n[lang] += (richTextNode as RichTextTextNode).text + ' '
      } else {
        validatorContext.searchTerms += (richTextNode as RichTextTextNode).text + ' '
      }
    }

    if ((richTextNode as RichTextReferenceNode).type === ElementNodeType.Reference) {
      const richTextReferenceNode = richTextNode as RichTextReferenceNode
      const contentModelSchemaFieldRichText = schema as ContentModelSchemaFieldRichText
      if (contentModelSchemaFieldRichText?.config?.ref) {
        await handleRef(richTextReferenceNode.reference, contentModelSchemaFieldRichText.config.ref)
      }
    }
  }

  switch (schema.type) {
    case ContentModelSchemaTypes.object: {
      const obj = data as MapType<any>
      if (obj) {
        for (const [key, val] of Object.entries(obj)) {
          await validateRecursive(validatorContext, schema.fields[key], val, persistentData?.[key])
        }
      }
      break
    }

    case ContentModelSchemaTypes.list: {
      const list = data as unknown[]
      if (list) {
        let i = 0
        for (const item of list) {
          await validateRecursive(validatorContext, schema.contentType, item, persistentData?.[i])
          i++
        }
      }
      break
    }

    case ContentModelSchemaTypes.union: {
      const union = data as MapType<any>
      const {unionCase, val} = destructUnionCase(union)
      if (unionCase) {
        await validateRecursive(
          validatorContext,
          schema.cases[unionCase],
          val,
          persistentData?.[unionCase]
        )
      }
      break
    }

    case ContentModelSchemaTypes.reference: {
      if (schema.i18n) {
        if (data) {
          for (const val of Object.values(data)) {
            await handleRef(val, schema.types)
          }
        }
        break
      }
      await handleRef(data, schema.types)
      break
    }

    case ContentModelSchemaTypes.media: {
      if (schema.i18n) {
        if (data) {
          for (const [lang, val] of Object.entries(data)) {
            await handleMedia(val as MediaPersisted, persistentData?.[lang])
          }
        }
        break
      }
      await handleMedia(data, persistentData)
      break
    }

    case ContentModelSchemaTypes.string: {
      if (schema.i18n) {
        if (data) {
          for (const [lang, val] of Object.entries(data)) {
            if (val && schema.searchable) {
              validatorContext.searchTermsI18n[lang] += val + ' '
            }
          }
        }
      } else if (data && schema.searchable) {
        validatorContext.searchTerms += data + ' '
      }
      break
    }

    case ContentModelSchemaTypes.richText: {
      if (schema.i18n) {
        for (const [lang, val] of Object.entries(data)) {
          const richTextNodes = val as RichTextNode[]
          await validateRichTextRecursive(lang, true, schema.searchable, {children: richTextNodes})
        }
        break
      }
      const richTextNodes = data as RichTextNode[]
      await validateRichTextRecursive(
        validatorContext.context.languageConfig.defaultLanguageTag,
        false,
        schema.searchable,
        {
          children: richTextNodes
        }
      )

      break
    }

    default:
      break
  }
}

export async function validateInput(
  validatorContext: ValidatorContext,
  schema?: MapType<ContentModelSchemas>,
  data?: MapType<any>,
  persistentData?: MapType<any>
) {
  if (!(data && schema)) return

  validatorContext.searchTermsI18n = validatorContext.context.languageConfig.languages.reduce(
    (accu, item) => {
      accu[item.tag] = ''
      return accu
    },
    {} as MapType<string>
  )

  for (const [key, val] of Object.entries(schema)) {
    await validateRecursive(validatorContext, val, data[key], persistentData?.[key])
  }
}
