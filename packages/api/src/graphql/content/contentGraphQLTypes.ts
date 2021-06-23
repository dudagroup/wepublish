import {
  GraphQLEnumType,
  GraphQLEnumValueConfigMap,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLString,
  valueFromASTUntyped
} from 'graphql'
import {LanguageConfigItem} from '../../interfaces/languageConfig'
import {Context} from '../../context'
import {GraphQLPageInfo} from '../common'
import {GraphQLPeer} from '../peer'
import {ContentSort} from './contentInterfaces'

export const GraphQLContentFilter = new GraphQLInputObjectType({
  name: 'ContentFilter',
  fields: {
    title: {type: GraphQLString}
  }
})

export const GraphQLContentSort = new GraphQLEnumType({
  name: 'ContentSort',
  values: {
    [ContentSort.CreatedAt]: {value: ContentSort.CreatedAt},
    [ContentSort.ModifiedAt]: {value: ContentSort.ModifiedAt},
    [ContentSort.PublicationDate]: {value: ContentSort.PublicationDate},
    [ContentSort.DePublicationDate]: {value: ContentSort.DePublicationDate}
  }
})

export const GraphQLJson = new GraphQLScalarType({
  name: 'Json',
  serialize(value) {
    return value
  },

  parseValue(value) {
    return value
  },

  parseLiteral(literal) {
    return valueFromASTUntyped(literal)
  }
})

export const GraphQLUnknown = new GraphQLScalarType({
  name: 'Unknown',
  serialize() {
    return null
  },

  parseValue() {
    return null
  },

  parseLiteral() {
    return null
  }
})

export function getGraphQLLanguagesEnum(languages: LanguageConfigItem[]) {
  const values = languages.reduce((accu, language) => {
    accu[language.tag] = {value: language.description}
    return accu
  }, {} as GraphQLEnumValueConfigMap)
  return new GraphQLEnumType({
    name: 'Languages',
    values: values
  })
}

export function getGraphQLContentConnection(parentName: string, content: GraphQLObjectType) {
  return new GraphQLObjectType({
    name: `${parentName}Connection`,
    fields: {
      nodes: {
        type: GraphQLNonNull(GraphQLList(GraphQLNonNull(content)))
      },
      pageInfo: {type: GraphQLNonNull(GraphQLPageInfo)},
      totalCount: {type: GraphQLNonNull(GraphQLInt)}
    }
  })
}

export function getGraphQLPeerCustomContent(parentName: string, content?: any) {
  return new GraphQLObjectType<any, Context>({
    name: `${parentName}PeerCustomContent`,
    fields: {
      peer: {
        type: GraphQLPeer,
        resolve: ({peerID}, _, {loaders}) => {
          if (peerID) {
            return loaders.peer.load(peerID)
          }
          return null
        }
      },
      content: {type: GraphQLNonNull(content)}
    }
  })
}
