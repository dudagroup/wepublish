import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLEnumValueConfigMap,
  GraphQLFloat,
  GraphQLID,
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
