import {
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import {Context} from '../../context'
import {createProxyingResolver} from '../../utility'
import {GraphQLImageTransformation, GraphQLInputPoint, GraphQLPoint} from '../image'
import {GraphQLUpload} from 'apollo-server-express'
import {GraphQLUnknown} from './contentGraphQLTypes'
import {GraphQLDateTime} from 'graphql-iso-date'

const mediaMedia = new GraphQLObjectType<any, Context>({
  name: 'media_media',
  fields: {
    createdAt: {type: GraphQLNonNull(GraphQLDateTime)},
    modifiedAt: {type: GraphQLNonNull(GraphQLDateTime)},

    filename: {type: GraphQLString},

    fileSize: {type: GraphQLNonNull(GraphQLInt)},
    extension: {type: GraphQLNonNull(GraphQLString)},
    mimeType: {type: GraphQLNonNull(GraphQLString)},

    url: {
      type: GraphQLString,
      resolve: createProxyingResolver((image, _, {mediaAdapter}) => {
        return mediaAdapter.getImageURL(image)
      })
    },

    transformURL: {
      type: GraphQLString,
      args: {input: {type: GraphQLImageTransformation}},
      resolve: createProxyingResolver((image, {input}, {mediaAdapter}) => {
        return image.transformURL ? image.transformURL : mediaAdapter.getImageURL(image, input)
      })
    },

    image: {
      type: new GraphQLObjectType<any, Context>({
        name: 'media_media_image',
        fields: {
          format: {type: GraphQLNonNull(GraphQLString)},
          width: {type: GraphQLNonNull(GraphQLInt)},
          height: {type: GraphQLNonNull(GraphQLInt)}
        }
      })
    }
  }
})

export const GraphQLMediaInput = new GraphQLInputObjectType({
  name: 'media_input',
  fields: {
    file: {type: GraphQLNonNull(GraphQLUpload!)},
    focalPoint: {type: GraphQLInputPoint},
    media: {type: GraphQLUnknown}
  }
})

export const GraphQLMedia = new GraphQLObjectType<any, Context>({
  name: 'media',
  fields: {
    id: {type: GraphQLNonNull(GraphQLID)},
    focalPoint: {type: GraphQLPoint},
    media: {type: mediaMedia}
  }
})
