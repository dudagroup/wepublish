import {
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLType,
  GraphQLUnionType
} from 'graphql'
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

const refTypeCache: {[type: string]: any} = {}
const refRecordTypeCache: {[type: string]: any} = {}
export function getReference(
  name: string,
  type: ContentModelSchemaFieldRef,
  context: TypeGeneratorContext
) {
  const prefix = context.isPublic ? '_cmRef' : '_cmpRef'
  const concatedTypeNames = Object.keys(type.types).join('_')
  const refTypeKey = prefix + '_' + concatedTypeNames // refTypeKey makes it possible to reuse identical references used over different models

  if (refTypeKey in refTypeCache) {
    return refTypeCache[refTypeKey]
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
        const prefix = context.isPublic ? '_cmRefCase' : '_cmpRefCase'
        const unionCaseObjectName = nameJoin(prefix, contentType)

        if (unionCaseObjectName in refRecordTypeCache) {
          return refRecordTypeCache[unionCaseObjectName]
        }

        let graphQLUnionCase: GraphQLType = GraphQLUnknown
        if (context.contentModels?.[contentType]) {
          graphQLUnionCase = context.contentModels[contentType]
        }

        refRecordTypeCache[unionCaseObjectName] = new GraphQLObjectType({
          name: unionCaseObjectName,
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
        return refRecordTypeCache[unionCaseObjectName]
      })
    })
  }

  refTypeCache[refTypeKey] = new GraphQLObjectType<any, Context>({
    name: `ref_${refTypeKey}`,
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
  return refTypeCache[refTypeKey]
}
