import {
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLType,
  GraphQLUnionType
} from 'graphql'
import {flattenI18nLeafFieldsMap} from '../../business/contentModelBusiness'
import {Context} from '../../context'
import {ContentModelSchemaFieldRef} from '../../interfaces/contentModelSchema'
import {Reference} from '../../interfaces/referenceType'
import {createProxyingIsTypeOf, createProxyingResolver} from '../../utility'
import {GraphQLPeer} from '../peer'
import {TypeGeneratorContext} from './contentGraphQlGenericTypes'
import {GraphQLUnknown} from './contentGraphQLTypes'
import {nameJoin} from './contentUtils'

export const GraphQLReferenceInput = new GraphQLInputObjectType({
  name: 'ref_input',
  fields: {
    recordId: {type: GraphQLNonNull(GraphQLID)},
    contentType: {type: GraphQLNonNull(GraphQLID)},
    peerId: {type: GraphQLID},
    record: {type: GraphQLUnknown},
    peer: {type: GraphQLUnknown}
  }
})

const refTypes: {[type: string]: any} = {}
export function getReference(
  name: string,
  type: ContentModelSchemaFieldRef,
  context: TypeGeneratorContext
) {
  const scope = context.isPublic ? 'public' : 'private'
  const typeKey = scope + '_' + Object.keys(type.types).join('_')

  if (typeKey in refTypes) {
    return refTypes[typeKey]
  }

  const refTypeArray = Object.entries(type.types)
  let graphQLRecordType: GraphQLType = GraphQLUnknown
  if (refTypeArray.length === 0) {
    throw Error('At least one type should be definied for Reference')
  } else if (refTypeArray.length === 1) {
    const contentType = refTypeArray[0][0]
    if (context.contentModels?.[contentType]) {
      graphQLRecordType = context.contentModels[contentType]
    }
  } else {
    graphQLRecordType = new GraphQLUnionType({
      name,
      types: refTypeArray.map(([contentType, {scope}]) => {
        let graphQLUnionCase: GraphQLType = GraphQLUnknown
        if (context.contentModels?.[contentType]) {
          graphQLUnionCase = context.contentModels[contentType]
        }

        const unionCaseName = nameJoin(name, contentType)
        return new GraphQLObjectType({
          name: unionCaseName,
          fields: {
            [contentType]: {
              type: graphQLUnionCase,
              resolve: source => {
                return source
              }
            }
          },
          isTypeOf: createProxyingIsTypeOf((value: Reference) => {
            return value.contentType === contentType
          })
        })
      })
    })
  }

  refTypes[typeKey] = new GraphQLObjectType<any, Context>({
    name: `ref_${typeKey}`,
    fields: {
      recordId: {type: GraphQLNonNull(GraphQLID)},
      contentType: {type: GraphQLNonNull(GraphQLID)},
      peerId: {type: GraphQLID},
      record: {
        type: graphQLRecordType,
        args: context.isPublic
          ? {
              language: {type: GraphQLNonNull(context.graphQlLanguages)}
            }
          : {},
        resolve: createProxyingResolver(async ({contentType, recordId}, {language}, {loaders}) => {
          if (context.isPublic) {
            return loaders.publicContentI18n.load(recordId + '_' + language)
          }
          return loaders.content.load(recordId)
        })
      },
      peer: {
        type: GraphQLPeer,
        resolve: createProxyingResolver(({peerId}, args, {loaders, dbAdapter}) => {
          if (peerId) {
            return loaders.peer.load(peerId)
          }
          return null
        })
      }
    }
  })
  return refTypes[typeKey]
}
