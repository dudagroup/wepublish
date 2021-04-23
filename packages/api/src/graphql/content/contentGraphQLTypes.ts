import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLEnumValueConfigMap,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLString
} from 'graphql'
import {LanguageConfigItem} from '../../interfaces/languageConfig'
import {ContentSort} from './contentInterfaces'
import {DBContentState} from '../../db/content'
import {Context} from '../../context'
import {GraphQLPageInfo} from '../common'
import {GraphQLPeer} from '../peer'

export const GraphQLContentFilter = new GraphQLInputObjectType({
  name: 'ContentFilter',
  fields: {
    title: {type: GraphQLString},
    draft: {type: GraphQLBoolean},
    published: {type: GraphQLBoolean},
    pending: {type: GraphQLBoolean},
    authors: {type: GraphQLList(GraphQLNonNull(GraphQLID))},
    tags: {type: GraphQLList(GraphQLNonNull(GraphQLString))}
  }
})

export const GraphQLPublicContentFilter = new GraphQLInputObjectType({
  name: 'ContentFilter',
  fields: {
    authors: {type: GraphQLList(GraphQLNonNull(GraphQLID))},
    tags: {type: GraphQLList(GraphQLNonNull(GraphQLString))}
  }
})

export const GraphQLContentSort = new GraphQLEnumType({
  name: 'ContentSort',
  values: {
    CREATED_AT: {value: ContentSort.CreatedAt},
    MODIFIED_AT: {value: ContentSort.ModifiedAt},
    PUBLISH_AT: {value: ContentSort.PublishAt},
    PUBLISHED_AT: {value: ContentSort.PublishedAt},
    UPDATED_AT: {value: ContentSort.UpdatedAt}
  }
})

export const GraphQLPublicContentSort = new GraphQLEnumType({
  name: 'ContentSort',
  values: {
    PUBLISHED_AT: {value: ContentSort.PublishedAt},
    UPDATED_AT: {value: ContentSort.UpdatedAt}
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

export const GraphQLContentSateEnum = new GraphQLEnumType({
  name: 'ContentStateEnum',
  values: Object.keys(DBContentState).reduce((accu, item) => {
    accu[item] = {
      value: item
    }
    return accu
  }, {} as GraphQLEnumValueConfigMap)
})

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
