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
  ContentModelSchemas,
  ContentModelSchemaTypes
} from '../../interfaces/contentModelSchema'
import {getI18nOutputType, getI18nInputType} from '../i18nPrimitives'
import {MapType} from '../../interfaces/utilTypes'
import {GraphQLMedia, GraphQLMediaInput} from './media'
import {nameJoin} from './contentUtils'

export interface TypeGeneratorContext {
  language: LanguageConfig
  isInput: boolean
  isPublic: boolean
  graphQlLanguages: GraphQLEnumType
  contentModels?: MapType<GraphQLObjectType>
}

function getLeaf(
  context: TypeGeneratorContext,
  contentModelSchemas: ContentModelSchemas,
  graphQLType: GraphQLInputType | GraphQLOutputType
) {
  if ((contentModelSchemas as ContentModelSchemaFieldLeaf).i18n && !context.isPublic) {
    if (context.isInput) {
      return getI18nInputType(graphQLType as GraphQLInputType, context.language)
    } else {
      return getI18nOutputType(graphQLType as GraphQLOutputType, context.language)
    }
  }
  return graphQLType
}

function generateType(
  context: TypeGeneratorContext,
  contentModelSchemas: ContentModelSchemas,
  name = ''
) {
  let type: any

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
      if (context.isInput) {
        type = new GraphQLInputObjectType({
          name,
          fields: Object.entries(contentModelSchemas.cases).reduce((accu, [key, val]) => {
            val.optional = true
            accu[`${key}`] = {
              type: generateType(context, val, nameJoin(name, key))
            }
            return accu
          }, {} as GraphQLInputFieldConfigMap)
        })
      } else {
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
      }

      break
    case ContentModelSchemaTypes.enum:
      type = new GraphQLEnumType({
        name,
        values: contentModelSchemas.values.reduce((accu, item) => {
          accu[`${item.value}`] = {value: item.value, description: item.description}
          return accu
        }, {} as GraphQLEnumValueConfigMap)
      })
      break
    case ContentModelSchemaTypes.object:
      if (context.isInput) {
        type = new GraphQLInputObjectType({
          name,
          fields: Object.entries(contentModelSchemas.fields).reduce((accu, [key, val]) => {
            accu[`${key}`] = {
              type: generateType(context, val, nameJoin(name, key)),
              description: val.instructions
            }
            return accu
          }, {} as GraphQLInputFieldConfigMap)
        })
      } else {
        type = new GraphQLObjectType({
          name,
          fields: Object.entries(contentModelSchemas.fields).reduce((accu, [key, val]) => {
            accu[`${key}`] = {
              type: generateType(context, val, nameJoin(name, key)),
              deprecationReason: val.deprecationReason,
              description: val.instructions
            }
            return accu
          }, {} as GraphQLFieldConfigMap<unknown, unknown, unknown>)
        })
      }
      break

    case ContentModelSchemaTypes.richText:
      type = getLeaf(context, contentModelSchemas, GraphQLRichText)
      break

    case ContentModelSchemaTypes.reference:
      contentModelSchemas.optional = true
      if (context.isInput) {
        type = getLeaf(context, contentModelSchemas, GraphQLReferenceInput)
      } else {
        type = getLeaf(
          context,
          contentModelSchemas,
          getReference(name, contentModelSchemas, context)
        )
      }
      break

    case ContentModelSchemaTypes.media:
      contentModelSchemas.optional = true
      if (context.isInput) {
        type = getLeaf(context, contentModelSchemas, GraphQLMediaInput)
      } else {
        type = getLeaf(context, contentModelSchemas, GraphQLMedia)
      }
      break
  }
  if (
    !contentModelSchemas.optional &&
    !((contentModelSchemas as ContentModelSchemaFieldLeaf).i18n && context.isPublic)
  ) {
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
    slugI18n: {type: GraphQLNonNull(getI18nOutputType(GraphQLString, languageConfig))},
    shared: {type: GraphQLNonNull(GraphQLBoolean)}
  }
  contentModels[identifier] = new GraphQLObjectType({
    name: id,
    fields: () =>
      Object.entries(contentModelSchema).reduce((accu, [key, val]) => {
        const schema = generateType(
          {
            language: languageConfig,
            isInput: false,
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
    const schema = generateType(
      {
        language: languageConfig,
        isInput: true,
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
        shared: {type: GraphQLNonNull(GraphQLBoolean)},
        ...content
      }
    })
  }
}
