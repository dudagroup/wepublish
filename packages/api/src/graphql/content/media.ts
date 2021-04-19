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
import {MediaDetail, MediaPersisted} from '../../interfaces/mediaType'
import {Image} from '../../db/image'

const mediaDetail = new GraphQLObjectType<MediaDetail, Context>({
  name: 'media_detail',
  fields: {
    id: {type: GraphQLNonNull(GraphQLID)},
    createdAt: {type: GraphQLNonNull(GraphQLDateTime)},
    modifiedAt: {type: GraphQLNonNull(GraphQLDateTime)},
    filename: {type: GraphQLString},
    fileSize: {type: GraphQLNonNull(GraphQLInt)},
    extension: {type: GraphQLNonNull(GraphQLString)},
    mimeType: {type: GraphQLNonNull(GraphQLString)},
    url: {
      type: GraphQLString,
      resolve: createProxyingResolver((image, _, {mediaAdapter}) => {
        const r = toImg(image as MediaPersisted)
        return mediaAdapter.getImageURL(r)
      })
    },

    transformURL: {
      type: GraphQLString,
      args: {input: {type: GraphQLImageTransformation}},
      resolve: createProxyingResolver((image, {input}, {mediaAdapter}) => {
        return (image as any)?.transformURL
          ? (image as any)?.transformURL
          : mediaAdapter.getImageURL(toImg(image as MediaPersisted), input)
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

function toImg(image: MediaPersisted): Image {
  const img: Pick<Image, 'id' | 'filename' | 'extension' | 'focalPoint'> = {
    id: image.id,
    filename: image.filename || '',
    extension: image.extension || '',
    focalPoint: image.focalPoint
  }
  return img as Image
}

export const GraphQLMediaInput = new GraphQLInputObjectType({
  name: 'media_input',
  fields: {
    file: {type: GraphQLUpload!},
    focalPoint: {type: GraphQLInputPoint},
    media: {type: GraphQLUnknown}
  }
})

export const GraphQLMedia = new GraphQLObjectType<any, Context>({
  name: 'media',
  fields: {
    focalPoint: {type: GraphQLPoint},
    media: {
      type: mediaDetail,
      resolve: createProxyingResolver((source, _) => {
        return source
      })
    }
  }
})
