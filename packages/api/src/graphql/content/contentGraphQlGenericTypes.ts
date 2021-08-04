/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLEnumValueConfigMap,
  GraphQLFieldConfig,
  GraphQLFieldConfigMap,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLString,
  GraphQLUnionType
} from 'graphql'
import {Context} from '../../context'
import {GraphQLRichText} from '../richText'
import {GraphQLDateTime} from 'graphql-iso-date'
import {LanguageConfig} from '../../interfaces/languageConfig'
import {getReference} from './reference'
import {createProxyingIsTypeOf} from '../../utility'
import {
  ContentModelSchema,
  ContentModelSchemaFieldLeaf,
  ContentModelSchemaFieldObject,
  ContentModelSchemaFieldRefTypeMap,
  ContentModelSchemas,
  ContentModelSchemaTypes
} from '../../interfaces/contentModelSchema'
import {getI18nOutputType} from '../i18nPrimitives'
import {MapType} from '../../interfaces/utilTypes'
import {GraphQLMedia} from './media'
import {nameJoin} from './contentUtils'
import {generateEmptyContent} from '../../business/contentUtil'
import {ContentModel} from '../..'
import {isObject} from '@karma.run/utility'

export interface TypeGeneratorContext {
  language: LanguageConfig
  isPublic: boolean
  graphQlLanguages: GraphQLEnumType
  contentModels?: MapType<GraphQLObjectType>
}

function getLeaf(
  context: TypeGeneratorContext,
  contentModelSchemas: ContentModelSchemas,
  graphQLType: GraphQLOutputType
): GraphQLOutputType {
  if ((contentModelSchemas as ContentModelSchemaFieldLeaf).i18n && !context.isPublic) {
    return getI18nOutputType(graphQLType, context.language)
  }
  return graphQLType
}

const typeCachePublic: {
  contentModelSchemas: ContentModelSchemas
  graphQlType: GraphQLOutputType
}[] = []
const typeCachePrivate: {
  contentModelSchemas: ContentModelSchemas
  graphQlType: GraphQLOutputType
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
  graphQlType: GraphQLOutputType,
  context: TypeGeneratorContext
) {
  if (!(contentModelSchemas as ContentModelSchemaFieldObject).name) return

  if (context.isPublic) {
    typeCachePublic.push({contentModelSchemas: contentModelSchemas, graphQlType: graphQlType})
  } else {
    typeCachePrivate.push({contentModelSchemas: contentModelSchemas, graphQlType: graphQlType})
  }
}

function generateType(
  context: TypeGeneratorContext,
  contentModelSchemas: ContentModelSchemas,
  name = ''
): GraphQLOutputType {
  let type: GraphQLOutputType

  switch (contentModelSchemas.type) {
    case ContentModelSchemaTypes.id:
      type = getLeaf(context, contentModelSchemas, GraphQLID)
      break
    case ContentModelSchemaTypes.string:
      type = getLeaf(context, contentModelSchemas, GraphQLString)
      break
    case ContentModelSchemaTypes.boolean:
      type = getLeaf(context, contentModelSchemas, GraphQLBoolean)
      break
    case ContentModelSchemaTypes.int:
      type = getLeaf(context, contentModelSchemas, GraphQLInt)
      break
    case ContentModelSchemaTypes.float:
      type = getLeaf(context, contentModelSchemas, GraphQLFloat)
      break
    case ContentModelSchemaTypes.dateTime:
      type = getLeaf(context, contentModelSchemas, GraphQLDateTime)
      break
    case ContentModelSchemaTypes.list:
      type = GraphQLList(generateType(context, contentModelSchemas.contentType, name))
      break
    case ContentModelSchemaTypes.union: {
      // Let's evaluate and maybe switch to the new tagged type https://github.com/graphql/graphql-spec/pull/733
      const unionName = contentModelSchemas.name || name
      const schema = getSchemaFromCache(contentModelSchemas, context)
      if (schema) {
        type = schema.graphQlType
      } else {
        type = new GraphQLUnionType({
          name: unionName,
          types: Object.entries(contentModelSchemas.cases).map(([unionCase, val]) => {
            const unionCaseName = nameJoin(unionName, unionCase)
            return new GraphQLObjectType({
              name: unionCaseName,
              fields: {
                [unionCase]: {
                  type: new GraphQLObjectType({
                    name: nameJoin(unionCaseName, 'content'),
                    fields: Object.entries(val.fields).reduce((accu, [key, val]) => {
                      accu[key] = generateFieldConfig(context, val, nameJoin(unionCaseName, key))
                      return accu
                    }, {} as GraphQLFieldConfigMap<unknown, Context, unknown>)
                  })
                }
              },
              isTypeOf: createProxyingIsTypeOf((value: any) => {
                return Object.keys(value)[0] === unionCase
              })
            })
          })
        })
        cacheSchema(contentModelSchemas, type, context)
      }
      break
    }
    case ContentModelSchemaTypes.enum: {
      const enumName = contentModelSchemas.name || name
      const schema = getSchemaFromCache(contentModelSchemas, context)
      if (schema) {
        type = schema.graphQlType
      } else {
        type = getLeaf(
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
      const objectName = contentModelSchemas.name || name
      const schema = getSchemaFromCache(contentModelSchemas, context)
      if (schema) {
        type = schema.graphQlType
      } else {
        type = new GraphQLObjectType({
          name: objectName,
          fields: Object.entries(contentModelSchemas.fields).reduce((accu, [key, modelSchema]) => {
            accu[key] = generateFieldConfig(context, modelSchema, nameJoin(objectName, key))
            return accu
          }, {} as GraphQLFieldConfigMap<unknown, Context, unknown>)
        })
        cacheSchema(contentModelSchemas, type, context)
      }
      break
    }

    case ContentModelSchemaTypes.richText:
      type = getLeaf(context, contentModelSchemas, GraphQLRichText)
      break

    case ContentModelSchemaTypes.reference:
      contentModelSchemas.optional = true // TODO reconsider if reference must be optional
      type = getLeaf(context, contentModelSchemas, getReference(name, contentModelSchemas, context))
      break

    case ContentModelSchemaTypes.media:
      contentModelSchemas.optional = true // TODO reconsider if media must be optional
      type = getLeaf(context, contentModelSchemas, GraphQLMedia)
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
): GraphQLFieldConfig<unknown, Context, unknown> {
  const fieldConfig: GraphQLFieldConfig<unknown, Context, unknown> = {
    type: generateType(context, contentModelSchemas, name),
    resolve: !context.isPublic
      ? (parent: any, args, context, {fieldName}) => {
          if (typeof parent === 'object' && parent !== null && fieldName in parent) {
            if (
              contentModelSchemas.optional ||
              (parent[fieldName] !== null && parent[fieldName] !== undefined)
            ) {
              return parent[fieldName]
            }
          }
          return generateEmptyContent(contentModelSchemas, context.languageConfig)
        }
      : undefined,
    deprecationReason: contentModelSchemas.deprecationReason,
    description: contentModelSchemas.instructions
  }

  return fieldConfig
}

const cache: any = {}
export function generateSchema(
  languageConfig: LanguageConfig,
  identifier: string,
  id: string,
  contentModelSchema: ContentModelSchema,
  contentModels: MapType<GraphQLObjectType>,
  isPublic = false,
  graphQlLanguages: GraphQLEnumType,
  contentModelConfigs: ContentModel[]
) {
  const baseFields: GraphQLFieldConfigMap<unknown, Context, unknown> = {
    id: {type: GraphQLNonNull(GraphQLID)},
    contentType: {type: GraphQLNonNull(GraphQLString)},

    createdAt: {type: GraphQLNonNull(GraphQLDateTime)},
    modifiedAt: {type: GraphQLNonNull(GraphQLDateTime)},

    publicationDate: {type: GraphQLDateTime},
    dePublicationDate: {type: GraphQLDateTime},

    title: {type: GraphQLNonNull(GraphQLString)},
    slugI18n: {
      type: GraphQLNonNull(getI18nOutputType(GraphQLString, languageConfig))
    },
    isActiveI18n: {
      type: GraphQLNonNull(getI18nOutputType(GraphQLBoolean, languageConfig)),
      resolve: (parent: any) => {
        if ('isActiveI18n' in parent) {
          return parent.isActiveI18n
        }
        return languageConfig.languages.reduce((accu, lang) => {
          accu[lang.tag] = true
          return accu
        }, {} as any)
      }
    },
    shared: {type: GraphQLNonNull(GraphQLBoolean)}
  }
  contentModels[identifier] = new GraphQLObjectType({
    name: id,
    fields: () => {
      // fields def as function allows circular dependencies

      const typeGeneratorContext: TypeGeneratorContext = {
        language: languageConfig,
        isPublic,
        graphQlLanguages,
        contentModels
      }

      const prefix = isPublic ? '_cmRef' : '_cmpRef'
      const name = prefix + '_' + 'richtext_references'
      if (!cache[name]) {
        cache[name] = getReference(
          name,
          {
            type: ContentModelSchemaTypes.reference,
            types: contentModelConfigs.reduce((accu, config) => {
              accu[config.identifier] = {scope: 'local'}
              return accu
            }, {} as ContentModelSchemaFieldRefTypeMap)
          },
          typeGeneratorContext
        )
      }

      baseFields.richTextReferences = {
        type: GraphQLNonNull(GraphQLList(GraphQLNonNull(cache[name]))),
        resolve: (parent: any) => {
          if (isObject(parent.richTextReferences)) {
            return Object.values(parent.richTextReferences)
          }
          return []
        }
      }

      return Object.entries(contentModelSchema).reduce((accu, [key, val]) => {
        const fieldConfig = generateFieldConfig(
          typeGeneratorContext,
          {
            type: ContentModelSchemaTypes.object,
            fields: val
          },
          nameJoin(id, key)
        )
        accu[key] = fieldConfig
        return accu
      }, baseFields)
    }
  })
  return contentModels[identifier]
}
