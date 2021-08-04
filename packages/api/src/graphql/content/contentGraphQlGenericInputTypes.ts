/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLEnumValueConfigMap,
  GraphQLFloat,
  GraphQLID,
  GraphQLInputFieldConfig,
  GraphQLInputFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString
} from 'graphql'
import {GraphQLRichText} from '../richText'
import {GraphQLDateTime} from 'graphql-iso-date'
import {LanguageConfig} from '../../interfaces/languageConfig'
import {GraphQLReferenceInput} from './reference'
import {
  ContentModelSchema,
  ContentModelSchemaFieldLeaf,
  ContentModelSchemaFieldObject,
  ContentModelSchemas,
  ContentModelSchemaTypes
} from '../../interfaces/contentModelSchema'
import {getI18nInputType} from '../i18nPrimitives'
import {GraphQLMediaInput} from './media'
import {nameJoin} from './contentUtils'
import {TypeGeneratorContext} from './contentGraphQlGenericTypes'

function getInputLeaf(
  context: TypeGeneratorContext,
  contentModelSchemas: ContentModelSchemas,
  graphQLType: GraphQLInputType
): GraphQLInputType {
  if ((contentModelSchemas as ContentModelSchemaFieldLeaf).i18n && !context.isPublic) {
    return getI18nInputType(graphQLType, context.language)
  }
  return graphQLType
}

const typeCachePublic: {
  contentModelSchemas: ContentModelSchemas
  graphQlType: GraphQLInputType
}[] = []
const typeCachePrivate: {
  contentModelSchemas: ContentModelSchemas
  graphQlType: GraphQLInputType
}[] = []

function getSchemaFromCache(
  contentModelSchemas: ContentModelSchemas,
  context: TypeGeneratorContext
) {
  if (context.isPublic) {
    return typeCachePublic.find(s => Object.is(s.contentModelSchemas, contentModelSchemas))
  } else {
    return typeCachePrivate.find(s => Object.is(s.contentModelSchemas, contentModelSchemas))
  }
}

function cacheSchema(
  contentModelSchemas: ContentModelSchemas,
  graphQlType: GraphQLInputType,
  context: TypeGeneratorContext
) {
  if (!(contentModelSchemas as ContentModelSchemaFieldObject).nameInput) return

  if (context.isPublic) {
    typeCachePublic.push({contentModelSchemas: contentModelSchemas, graphQlType: graphQlType})
  } else {
    typeCachePrivate.push({contentModelSchemas: contentModelSchemas, graphQlType: graphQlType})
  }
}

function generateInputType(
  context: TypeGeneratorContext,
  contentModelSchemas: ContentModelSchemas,
  name = ''
): GraphQLInputType {
  let type: GraphQLInputType

  switch (contentModelSchemas.type) {
    case ContentModelSchemaTypes.id:
      type = getInputLeaf(context, contentModelSchemas, GraphQLID)
      break
    case ContentModelSchemaTypes.string:
      type = getInputLeaf(context, contentModelSchemas, GraphQLString)
      break
    case ContentModelSchemaTypes.boolean:
      type = getInputLeaf(context, contentModelSchemas, GraphQLBoolean)
      break
    case ContentModelSchemaTypes.int:
      type = getInputLeaf(context, contentModelSchemas, GraphQLInt)
      break
    case ContentModelSchemaTypes.float:
      type = getInputLeaf(context, contentModelSchemas, GraphQLFloat)
      break
    case ContentModelSchemaTypes.dateTime:
      type = getInputLeaf(context, contentModelSchemas, GraphQLDateTime)
      break
    case ContentModelSchemaTypes.list:
      type = GraphQLList(generateInputType(context, contentModelSchemas.contentType, name))
      break
    case ContentModelSchemaTypes.union: {
      // Let's evaluate and maybe switch to the new tagged type https://github.com/graphql/graphql-spec/pull/733
      const unionName = contentModelSchemas.nameInput || name
      const schema = getSchemaFromCache(contentModelSchemas, context)
      if (schema) {
        type = schema.graphQlType
      } else {
        type = new GraphQLInputObjectType({
          name: unionName,
          fields: Object.entries(contentModelSchemas.cases).reduce((accu, [key, val]) => {
            accu[key] = generateFieldConfig(
              context,
              {...val, optional: true},
              nameJoin(unionName, key)
            )
            return accu
          }, {} as GraphQLInputFieldConfigMap)
        })
        cacheSchema(contentModelSchemas, type, context)
      }
      break
    }
    case ContentModelSchemaTypes.enum: {
      const enumName = contentModelSchemas.nameInput || name
      const schema = getSchemaFromCache(contentModelSchemas, context)
      if (schema) {
        type = schema.graphQlType
      } else {
        type = getInputLeaf(
          context,
          contentModelSchemas,
          new GraphQLEnumType({
            name: enumName,
            values: contentModelSchemas.values.reduce((accu, item) => {
              accu[`${item.value}`] = {value: item.value, description: item.description}
              return accu
            }, {} as GraphQLEnumValueConfigMap)
          })
        )
        cacheSchema(contentModelSchemas, type, context)
      }
      break
    }

    case ContentModelSchemaTypes.object: {
      const objectName = contentModelSchemas.nameInput || name
      const schema = getSchemaFromCache(contentModelSchemas, context)
      if (schema) {
        type = schema.graphQlType
      } else {
        type = new GraphQLInputObjectType({
          name: objectName,
          fields: Object.entries(contentModelSchemas.fields).reduce((accu, [key, val]) => {
            accu[key] = generateFieldConfig(context, val, nameJoin(objectName, key))
            return accu
          }, {} as GraphQLInputFieldConfigMap)
        })
        cacheSchema(contentModelSchemas, type, context)
      }
      break
    }

    case ContentModelSchemaTypes.richText:
      type = getInputLeaf(context, contentModelSchemas, GraphQLRichText)
      break

    case ContentModelSchemaTypes.reference:
      contentModelSchemas.optional = true // TODO reconsider if reference must be optional
      type = getInputLeaf(context, contentModelSchemas, GraphQLReferenceInput)
      break

    case ContentModelSchemaTypes.media:
      contentModelSchemas.optional = true // TODO reconsider if media must be optional
      type = getInputLeaf(context, contentModelSchemas, GraphQLMediaInput)
      break
  }
  if (!contentModelSchemas.optional) {
    type = GraphQLNonNull(type)
  }
  return type
}

function generateFieldConfig(
  context: TypeGeneratorContext,
  contentModelSchemas: ContentModelSchemas,
  name = ''
): GraphQLInputFieldConfig {
  const fieldConfig: GraphQLInputFieldConfig = {
    type: generateInputType(context, contentModelSchemas, name),
    description: contentModelSchemas.instructions
  }

  return fieldConfig
}

export function generateInputSchema(
  languageConfig: LanguageConfig,
  identifier: string,
  contentModelSchema: ContentModelSchema,
  isPublic = false,
  graphQlLanguages: GraphQLEnumType
) {
  const content = Object.entries(contentModelSchema).reduce((accu, [key, val]) => {
    const fieldConfig = generateFieldConfig(
      {
        language: languageConfig,
        isPublic,
        graphQlLanguages
      },
      {
        type: ContentModelSchemaTypes.object,
        fields: val
      },
      nameJoin(identifier, key)
    )
    accu[key] = fieldConfig
    return accu
  }, {} as GraphQLInputFieldConfigMap)
  return {
    create: new GraphQLInputObjectType({
      name: nameJoin(identifier, 'create'),
      fields: {
        title: {type: GraphQLNonNull(GraphQLString)},
        slugI18n: {type: GraphQLNonNull(getI18nInputType(GraphQLString, languageConfig))},
        isActiveI18n: {type: GraphQLNonNull(getI18nInputType(GraphQLBoolean, languageConfig))},
        shared: {type: GraphQLNonNull(GraphQLBoolean)},
        ...content
      }
    }),
    update: new GraphQLInputObjectType({
      name: nameJoin(identifier, 'update'),
      fields: {
        id: {type: GraphQLNonNull(GraphQLID)},
        title: {type: GraphQLNonNull(GraphQLString)},
        slugI18n: {type: GraphQLNonNull(getI18nInputType(GraphQLString, languageConfig))},
        isActiveI18n: {type: GraphQLNonNull(getI18nInputType(GraphQLBoolean, languageConfig))},
        shared: {type: GraphQLNonNull(GraphQLBoolean)},
        ...content
      }
    })
  }
}
