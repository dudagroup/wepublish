/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLEnumValueConfigMap,
  GraphQLFloat,
  GraphQLID,
  GraphQLInputFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import {GraphQLDateTime} from 'graphql-iso-date'
import {
  ContentModelSchema,
  ContentModelSchemaFieldEnum,
  ContentModelSchemaFieldLeaf,
  ContentModelSchemaFieldList,
  ContentModelSchemaFieldObject,
  ContentModelSchemaFieldUnion,
  ContentModelSchemas,
  ContentModelSchemaTypes
} from '../../interfaces/contentModelSchema'
import {LanguageConfig} from '../../interfaces/languageConfig'
import {MapType} from '../../interfaces/utilTypes'
import {nameJoin} from './contentUtils'

const PATH_DELIMITER = '__'

interface Context {
  languageConfig: LanguageConfig
  isPublic: boolean
  fields: GraphQLInputFieldConfigMap
  contentModels?: MapType<GraphQLObjectType>
}

export function getFilter(
  languageConfig: LanguageConfig,
  identifier: string,
  contentModelSchema: ContentModelSchema,
  isPublic = false
) {
  const name = nameJoin('filter', identifier)
  return new GraphQLInputObjectType({
    name: name,
    fields: collectArgsForcontent(name, isPublic, languageConfig, contentModelSchema)
  })
}

function collectArgsForcontent(
  name: string,
  isPublic: boolean,
  languageConfig: LanguageConfig,
  contentModelSchema: ContentModelSchema
) {
  const fields: GraphQLInputFieldConfigMap = {
    title: {type: GraphQLString} // default filter
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
        context.fields[generatePath()] = {
          type: GraphQlFilterText
        }
        break

      case ContentModelSchemaTypes.boolean:
        context.fields[generatePath()] = {
          type: GraphQlFilterBoolean
        }
        break

      case ContentModelSchemaTypes.int:
        context.fields[generatePath()] = {
          type: GraphQlFilterInt
        }
        break

      case ContentModelSchemaTypes.float:
        context.fields[generatePath()] = {
          type: GraphQlFilterFloat
        }
        break

      case ContentModelSchemaTypes.dateTime:
        context.fields[generatePath()] = {
          type: GraphQlFilterDate
        }
        break

      case ContentModelSchemaTypes.enum:
        context.fields[generatePath()] = {
          type: getGraphQlFilterEnum(name, contentModelSchemas)
        }
        break

      case ContentModelSchemaTypes.reference:
        context.fields[[...path, 'recordId'].join(PATH_DELIMITER)] = {
          type: GraphQlFilterReference
        }
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

const GraphQlFilterText = new GraphQLInputObjectType({
  name: `FilterText`,
  fields: {
    eq: {
      type: GraphQLString,
      description: 'equal to'
    },
    ne: {
      type: GraphQLString,
      description: 'not equal to'
    }
  }
})

const GraphQlFilterDate = new GraphQLInputObjectType({
  name: `FilterDate`,
  fields: {
    gt: {
      type: GraphQLDateTime,
      description: 'greater than'
    },
    lt: {
      type: GraphQLDateTime,
      description: 'less than'
    },
    eq: {
      type: GraphQLDateTime,
      description: 'less than'
    }
  }
})

const GraphQlFilterBoolean = new GraphQLInputObjectType({
  name: `FilterBoolean`,
  fields: {
    eq: {
      type: GraphQLBoolean,
      description: 'equal to'
    }
  }
})

const GraphQlFilterInt = new GraphQLInputObjectType({
  name: `FilterInt`,
  fields: {
    gt: {
      type: GraphQLInt,
      description: 'greater than'
    },
    lt: {
      type: GraphQLInt,
      description: 'less than'
    },
    eq: {
      type: GraphQLInt,
      description: 'less than'
    }
  }
})

const GraphQlFilterFloat = new GraphQLInputObjectType({
  name: `FilterFloat`,
  fields: {
    gt: {
      type: GraphQLFloat,
      description: 'greater than'
    },
    lt: {
      type: GraphQLFloat,
      description: 'less than'
    },
    eq: {
      type: GraphQLFloat,
      description: 'less than'
    }
  }
})

const GraphQlFilterReference = new GraphQLInputObjectType({
  name: `FilterReference`,
  fields: {
    in: {
      type: GraphQLList(GraphQLNonNull(GraphQLID)),
      description: 'in'
    },
    nin: {
      type: GraphQLList(GraphQLNonNull(GraphQLID)),
      description: 'not in'
    }
  }
})

function getGraphQlFilterEnum(
  name: string,
  contentModelSchemaFieldEnum: ContentModelSchemaFieldEnum
) {
  const graphQLEnum = new GraphQLEnumType({
    name: nameJoin(name, 'enum'),
    values: contentModelSchemaFieldEnum.values.reduce((accu, item) => {
      accu[`${item.value}`] = {value: item.value, description: item.description}
      return accu
    }, {} as GraphQLEnumValueConfigMap)
  })

  return new GraphQLInputObjectType({
    name: nameJoin(name),
    fields: {
      eq: {
        type: graphQLEnum,
        description: 'equal to'
      },
      ne: {
        type: graphQLEnum,
        description: 'not equal to'
      }
    }
  })
}
