/* eslint-disable @typescript-eslint/no-use-before-define */
import {GraphQLEnumType, GraphQLEnumValueConfigMap, GraphQLObjectType} from 'graphql'
import {
  ContentModelSchema,
  ContentModelSchemaFieldLeaf,
  ContentModelSchemaFieldList,
  ContentModelSchemaFieldObject,
  ContentModelSchemaFieldUnion,
  ContentModelSchemas,
  ContentModelSchemaTypes
} from '../../interfaces/contentModelSchema'
import {LanguageConfig} from '../../interfaces/languageConfig'
import {MapType} from '../../interfaces/utilTypes'
import {ContentSort} from './contentInterfaces'
import {nameJoin} from './contentUtils'

const PATH_DELIMITER = '__'

interface Context {
  languageConfig: LanguageConfig
  isPublic: boolean
  fields: GraphQLEnumValueConfigMap
  contentModels?: MapType<GraphQLObjectType>
}

export function getSort(
  languageConfig: LanguageConfig,
  identifier: string,
  contentModelSchema: ContentModelSchema,
  isPublic = false
) {
  const name = nameJoin('sort', identifier)
  return new GraphQLEnumType({
    name: name,
    values: collectArgs(name, isPublic, languageConfig, contentModelSchema)
  })
}

function collectArgs(
  name: string,
  isPublic: boolean,
  languageConfig: LanguageConfig,
  contentModelSchema: ContentModelSchema
) {
  const fields: GraphQLEnumValueConfigMap = {
    [ContentSort.CreatedAt]: {value: ContentSort.CreatedAt},
    [ContentSort.ModifiedAt]: {value: ContentSort.ModifiedAt},
    [ContentSort.PublicationDate]: {value: ContentSort.PublicationDate},
    [ContentSort.DePublicationDate]: {value: ContentSort.DePublicationDate}
  }

  for (const [key, schema] of Object.entries(contentModelSchema)) {
    const childName = nameJoin(name, key)
    collectArgFields(
      {
        isPublic,
        languageConfig,
        fields
      },
      {
        type: ContentModelSchemaTypes.object,
        fields: schema
      },
      childName,
      [key]
    )
  }
  return fields
}

function collectArgFields(
  context: Context,
  contentModelSchemas: ContentModelSchemas,
  name = '',
  path = ['']
) {
  const contentModelSchemaFieldLeaf = contentModelSchemas as ContentModelSchemaFieldLeaf

  function generatePath() {
    if ((contentModelSchemas as ContentModelSchemaFieldLeaf).i18n) {
      return ['i18n', ...path].join(PATH_DELIMITER)
    }
    return path.join(PATH_DELIMITER)
  }

  if (contentModelSchemaFieldLeaf.filterable) {
    switch (contentModelSchemas.type) {
      case ContentModelSchemaTypes.id:
      case ContentModelSchemaTypes.string:
      case ContentModelSchemaTypes.boolean:
      case ContentModelSchemaTypes.int:
      case ContentModelSchemaTypes.float:
      case ContentModelSchemaTypes.dateTime:
      case ContentModelSchemaTypes.enum:
        context.fields[generatePath()] = {value: generatePath()}
        break
    }
  }

  switch (contentModelSchemas.type) {
    case ContentModelSchemaTypes.list: {
      const contentModelSchemaFieldList = contentModelSchemas as ContentModelSchemaFieldList
      collectArgFields(context, contentModelSchemaFieldList.contentType, name, path)
      break
    }

    case ContentModelSchemaTypes.union: {
      const contentModelSchemaFieldObject = contentModelSchemas as ContentModelSchemaFieldUnion
      for (const [key, schema] of Object.entries(contentModelSchemaFieldObject.cases)) {
        collectArgFields(context, schema, nameJoin(name, key), [...path, key])
      }
      break
    }

    case ContentModelSchemaTypes.object: {
      const contentModelSchemaFieldObject = contentModelSchemas as ContentModelSchemaFieldObject
      for (const [key, schema] of Object.entries(contentModelSchemaFieldObject.fields)) {
        collectArgFields(context, schema, nameJoin(name, key), [...path, key])
      }
      break
    }
  }
}
