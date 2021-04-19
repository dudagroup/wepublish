import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLScalarType,
  GraphQLString
} from 'graphql'
import {ContentSort} from './contentInterfaces'

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
