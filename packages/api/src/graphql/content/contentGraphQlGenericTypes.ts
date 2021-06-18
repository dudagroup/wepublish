import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLEnumValueConfigMap,
  GraphQLFieldConfigMap,
  GraphQLFloat,
  GraphQLID,
  GraphQLInputFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLString,
  GraphQLUnionType
} from 'graphql'
import {GraphQLRichText} from '../richText'
import {GraphQLDateTime} from 'graphql-iso-date'
import {LanguageConfig} from '../../interfaces/languageConfig'
import {getReference, GraphQLReferenceInput} from './reference'
import {createProxyingIsTypeOf} from '../../utility'
import {
  ContentModelSchema,
  ContentModelSchemaFieldLeaf,
  ContentModelSchemaFieldString,
  ContentModelSchemas,
  ContentModelSchemaTypes
} from '../../interfaces/contentModelSchema'
import {getI18nOutputType, getI18nInputType} from '../i18nPrimitives'
import {MapType} from '../../interfaces/utilTypes'
import {GraphQLMedia, GraphQLMediaInput} from './media'
import {nameJoin} from './contentUtils'
import {generateEmptyContent} from '../../business/contentUtil'

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
    case ContentModelSchemaTypes.union:
      // Let's evaluate and maybe switch to the new tagged type https://github.com/graphql/graphql-spec/pull/733
      type = new GraphQLUnionType({
        name,
        types: Object.entries(contentModelSchemas.cases).map(([unionCase, val]) => {
          const unionCaseName = nameJoin(name, unionCase)
          return new GraphQLObjectType({
            name: unionCaseName,
            fields: {
              [unionCase]: {
                type: new GraphQLObjectType({
                  name: nameJoin(unionCaseName, 'content'),
                  fields: Object.entries(val.fields).reduce((accu, [key, val]) => {
                    accu[`${key}`] = {
                      type: generateType(context, val, nameJoin(unionCaseName, key)),
                      deprecationReason: val.deprecationReason,
                      description: val.instructions
                    }
                    return accu
                  }, {} as GraphQLFieldConfigMap<unknown, unknown, unknown>)
                })
              }
            },
            isTypeOf: createProxyingIsTypeOf((value: any) => {
              return Object.keys(value)[0] === unionCase
            })
          })
        })
      })
      break
    case ContentModelSchemaTypes.enum:
      type = getLeaf(
        context,
        contentModelSchemas,
        new GraphQLEnumType({
          name,
          values: contentModelSchemas.values.reduce((accu, item) => {
            accu[`${item.value}`] = {value: item.value, description: item.description}
            return accu
          }, {} as GraphQLEnumValueConfigMap)
        })
      )
      break
    case ContentModelSchemaTypes.object:
      type = new GraphQLObjectType({
        name,
        fields: Object.entries(contentModelSchemas.fields).reduce((accu, [key, modelSchema]) => {
          accu[key] = {
            type: generateType(context, modelSchema, nameJoin(name, key)),
            resolve: !context.isPublic
              ? (parent: any) => {
                  if (typeof parent === 'object' && parent !== null && key in parent) {
                    if (
                      modelSchema.optional ||
                      (parent[key] !== null && parent[key] !== undefined)
                    ) {
                      return parent[key]
                    }
                  }
                  return generateEmptyContent(modelSchema, context.language)
                }
              : undefined,
            deprecationReason: modelSchema.deprecationReason,
            description: modelSchema.instructions
          }
          return accu
        }, {} as GraphQLFieldConfigMap<unknown, unknown, unknown>)
      })
      break

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
    case ContentModelSchemaTypes.union:
      // Let's evaluate and maybe switch to the new tagged type https://github.com/graphql/graphql-spec/pull/733
      type = new GraphQLInputObjectType({
        name,
        fields: Object.entries(contentModelSchemas.cases).reduce((accu, [key, val]) => {
          accu[`${key}`] = {
            type: generateInputType(context, {...val, optional: true}, nameJoin(name, key))
          }
          return accu
        }, {} as GraphQLInputFieldConfigMap)
      })
      break
    case ContentModelSchemaTypes.enum:
      type = getInputLeaf(
        context,
        contentModelSchemas,
        new GraphQLEnumType({
          name,
          values: contentModelSchemas.values.reduce((accu, item) => {
            accu[`${item.value}`] = {value: item.value, description: item.description}
            return accu
          }, {} as GraphQLEnumValueConfigMap)
        })
      )
      break
    case ContentModelSchemaTypes.object:
      type = new GraphQLInputObjectType({
        name,
        fields: Object.entries(contentModelSchemas.fields).reduce((accu, [key, val]) => {
          accu[key] = {
            type: generateInputType(context, val, nameJoin(name, key)),
            description: val.instructions
          }
          return accu
        }, {} as GraphQLInputFieldConfigMap)
      })
      break

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

export function generateSchema(
  languageConfig: LanguageConfig,
  identifier: string,
  id: string,
  contentModelSchema: ContentModelSchema,
  contentModels: MapType<GraphQLObjectType>,
  isPublic = false,
  graphQlLanguages: GraphQLEnumType
) {
  const baseFields: GraphQLFieldConfigMap<unknown, unknown, unknown> = {
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
    fields: () =>
      Object.entries(contentModelSchema).reduce((accu, [key, val]) => {
        const schema = generateType(
          {
            language: languageConfig,
            isPublic,
            graphQlLanguages,
            contentModels
          },
          {
            type: ContentModelSchemaTypes.object,
            fields: val
          },
          nameJoin(id, key)
        )
        accu[`${key}`] = {
          type: schema
        }
        return accu
      }, baseFields)
  })
  return contentModels[identifier]
}

export function generateInputSchema(
  languageConfig: LanguageConfig,
  identifier: string,
  contentModelSchema: ContentModelSchema,
  isPublic = false,
  graphQlLanguages: GraphQLEnumType
) {
  const content = Object.entries(contentModelSchema).reduce((accu, [key, val]) => {
    const schema = generateInputType(
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
    accu[key] = {
      type: schema
    }
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
