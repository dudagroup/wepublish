import {
  ArgumentNode,
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLEnumValueConfigMap,
  GraphQLFieldConfigMap,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  Kind
} from 'graphql'
import {GraphQLDateTime} from 'graphql-iso-date'
import {Context, ContextOptions} from '../../context'
import {InputCursor, Limit, SortOrder} from '../../db/common'
import {NotAuthorisedError} from '../../error'
import {
  getGraphQLContentConnection,
  getGraphQLLanguagesEnum,
  getGraphQLPeerCustomContent,
  GraphQLContentFilter,
  GraphQLContentSort,
  GraphQLPublicContentFilter,
  GraphQLPublicContentSort
} from './contentGraphQLTypes'
import {GraphQLPageInfo, GraphQLSortOrder} from '../common'
import {
  authorise,
  CanDeleteContent,
  CanGetContent,
  CanGetContents,
  CanGetPeerContent,
  CanGetPeerContents,
  CanGetSharedContent,
  CanGetSharedContents,
  isAuthorised
} from '../permissions'
import {ContentSort} from './contentInterfaces'

import {base64Decode, base64Encode, delegateToPeerSchema} from '../../utility'

import {WrapQuery} from 'graphql-tools'
import {
  nameJoin,
  ContentModelPrefix,
  ContentModelPrefixPrivate,
  ContentModelPrefixPrivateInput
} from './contentUtils'
import {MapType} from '../../interfaces/utilTypes'
import {generateInputSchema, generateSchema} from './contentGraphQlGenericTypes'
import {flattenI18nLeafFieldsMap} from '../../business/contentModelBusiness'
import {getFilter} from './contentGraphQLFilter'
import {getI18nOutputType} from '../i18nPrimitives'

export interface PeerContent {
  peerID: string
  content: any
}

export function getGraphQLContent(contextOptions: ContextOptions) {
  if (!(contextOptions?.contentModels && contextOptions.contentModels.length > 0)) {
    return
  }
  const graphQlLanguages = getGraphQLLanguagesEnum(contextOptions.languageConfig.languages)
  const query: GraphQLFieldConfigMap<unknown, Context> = {}
  const queryPublic: GraphQLFieldConfigMap<unknown, Context> = {}
  const mutation: GraphQLFieldConfigMap<unknown, Context> = {}

  const contentModelsPrivate: MapType<GraphQLObjectType> = {}
  const contentModelsPublic: MapType<GraphQLObjectType> = {}

  contextOptions.contentModels.forEach(model => {
    const idPublic = nameJoin(ContentModelPrefix, model.identifier)
    const idPrivate = nameJoin(ContentModelPrefixPrivate, model.identifier)
    const idPrivateInput = nameJoin(ContentModelPrefixPrivateInput, model.identifier)
    const typePublic = generateSchema(
      contextOptions.languageConfig,
      model.identifier,
      nameJoin(idPublic, 'record'),
      model.schema,
      contentModelsPublic,
      true,
      graphQlLanguages
    )
    const typePrivate = generateSchema(
      contextOptions.languageConfig,
      model.identifier,
      nameJoin(idPrivate, 'record'),
      model.schema,
      contentModelsPrivate,
      false,
      graphQlLanguages
    )
    const {create: inputTypeCreate, update: inputTypeUpdate} = generateInputSchema(
      contextOptions.languageConfig,
      nameJoin(idPrivateInput, 'record'),
      model.schema,
      false,
      graphQlLanguages
    )
    const filter = getFilter(contextOptions.languageConfig, model.identifier, model.schema, false)

    // ************************************************************************************************************************
    // Public Query
    queryPublic[model.identifier] = {
      type: GraphQLNonNull(
        new GraphQLObjectType<undefined, Context>({
          name: idPublic,
          fields: {
            read: {
              type: typePublic,
              args: {
                id: {type: GraphQLID},
                slug: {type: GraphQLString},
                language: {type: graphQlLanguages}
              },
              async resolve(source, {id, slug, language}, {loaders, dbAdapter}) {
                if (id) {
                  const result = await loaders.publicContent.load(id)
                  flattenI18nLeafFieldsMap(
                    contextOptions.languageConfig,
                    model.schema,
                    language
                  )(result)
                  return result
                } else if (slug && language) {
                  const result = await dbAdapter.content.getContentBySlug(slug, language, true)
                  flattenI18nLeafFieldsMap(
                    contextOptions.languageConfig,
                    model.schema,
                    language
                  )(result)
                  return result
                }
                return null
              }
            },

            list: {
              type: GraphQLNonNull(
                new GraphQLObjectType({
                  name: nameJoin(idPublic, 'list'),
                  fields: {
                    nodes: {
                      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(typePublic)))
                    },
                    pageInfo: {type: GraphQLNonNull(GraphQLPageInfo)},
                    totalCount: {type: GraphQLNonNull(GraphQLInt)}
                  }
                })
              ),
              args: {
                language: {type: graphQlLanguages},
                after: {type: GraphQLID},
                before: {type: GraphQLID},
                first: {type: GraphQLInt},
                last: {type: GraphQLInt},
                skip: {type: GraphQLInt},
                filter: {type: GraphQLPublicContentFilter},
                sort: {
                  type: GraphQLPublicContentSort,
                  defaultValue: ContentSort.PublishedAt
                },
                order: {type: GraphQLSortOrder, defaultValue: SortOrder.Descending}
              },
              resolve: async (
                source,
                {filter, sort, order, after, before, first, skip, last, language},
                {dbAdapter}
              ) => {
                const result = await dbAdapter.content.getContents(
                  {
                    type: model.identifier,
                    filter,
                    sort,
                    order,
                    cursor: InputCursor(after, before),
                    limit: Limit(first, last, skip)
                  },
                  contextOptions.languageConfig,
                  true
                )
                result.nodes.forEach(
                  flattenI18nLeafFieldsMap(contextOptions.languageConfig, model.schema, language)
                )
                return result
              }
            }
          }
        })
      ),
      resolve: () => {
        return {}
      }
    }

    // ************************************************************************************************************************
    // Private Mutation
    mutation[model.identifier] = {
      type: GraphQLNonNull(
        new GraphQLObjectType<undefined, Context>({
          name: idPrivateInput,
          fields: {
            create: {
              type: GraphQLNonNull(typePrivate),
              args: {
                input: {
                  type: GraphQLNonNull(inputTypeCreate)
                }
              },
              async resolve(source, {input}, {business}) {
                return business.createContent(model.identifier, input)
              }
            },

            update: {
              type: GraphQLNonNull(typePrivate),
              args: {
                input: {
                  type: GraphQLNonNull(inputTypeUpdate)
                }
              },
              async resolve(source, {input}, {business}) {
                return business.updateContent(model.identifier, input)
              }
            },

            delete: {
              type: GraphQLNonNull(GraphQLBoolean),
              args: {
                id: {type: GraphQLNonNull(GraphQLID)}
              },
              async resolve(source, {id}, {business}) {
                return business.deleteContent(id)
              }
            },

            publish: {
              type: typePrivate,
              args: {
                id: {type: GraphQLNonNull(GraphQLID)},
                publicationDate: {type: GraphQLDateTime}
              },
              async resolve(source, {id, publicationDate}, {business}) {
                return business.publishContent(id, publicationDate)
              }
            },

            unpublish: {
              type: typePrivate,
              args: {id: {type: GraphQLNonNull(GraphQLID)}},
              async resolve(source, {id}, {business}) {
                return business.unpublishContent(id)
              }
            }
          }
        })
      ),
      resolve: () => {
        return {}
      }
    }

    // ************************************************************************************************************************
    // Private Query
    query[model.identifier] = {
      type: GraphQLNonNull(
        new GraphQLObjectType<undefined, Context>({
          name: idPrivate,
          fields: {
            read: {
              type: typePrivate,
              args: {
                peerID: {type: GraphQLID},
                id: {type: GraphQLNonNull(GraphQLID)}
              },
              async resolve(root, {peerID, id}, context, info) {
                if (peerID) {
                  const {authenticate} = context
                  const {roles} = authenticate()

                  authorise(CanGetPeerContent, roles)

                  return delegateToPeerSchema(peerID, true, context, {
                    fieldName: `content`,
                    args: {id},
                    info,
                    transforms: [
                      new WrapQuery(
                        ['content'],
                        subtree => ({
                          kind: Kind.SELECTION_SET,
                          selections: [
                            {
                              kind: Kind.FIELD,
                              name: {
                                kind: Kind.NAME,
                                value: model.identifier
                              },
                              selectionSet: {
                                kind: Kind.SELECTION_SET,
                                selections: [
                                  {
                                    kind: Kind.FIELD,
                                    name: {kind: Kind.NAME, value: 'read'},
                                    arguments: [
                                      {
                                        kind: Kind.ARGUMENT,
                                        name: {kind: Kind.NAME, value: 'id'},
                                        value: {kind: Kind.STRING, value: id}
                                      }
                                    ],
                                    selectionSet: subtree
                                  }
                                ]
                              }
                            }
                          ]
                        }),
                        result => {
                          return result[model.identifier].read
                        }
                      )
                    ]
                  })
                }

                const {authenticate, loaders} = context
                const {roles} = authenticate()

                const canGetContent = isAuthorised(CanGetContent, roles)
                const canGetSharedContent = isAuthorised(CanGetSharedContent, roles)

                if (canGetContent || canGetSharedContent) {
                  const content = await loaders.content.load(id)

                  if (canGetContent) {
                    return content
                  } else {
                    return content?.shared ? content : null
                  }
                } else {
                  throw new NotAuthorisedError()
                }
              }
            },
            list: {
              type: GraphQLNonNull(getGraphQLContentConnection(idPrivate, typePrivate)),
              args: {
                after: {type: GraphQLID},
                before: {type: GraphQLID},
                first: {type: GraphQLInt},
                last: {type: GraphQLInt},
                skip: {type: GraphQLInt},
                filter: {type: filter},
                sort: {type: GraphQLContentSort, defaultValue: ContentSort.ModifiedAt},
                order: {type: GraphQLSortOrder, defaultValue: SortOrder.Descending},
                language: {type: graphQlLanguages}
              },
              resolve(
                source,
                {filter, sort, order, language, after, before, first, skip, last},
                {authenticate, dbAdapter}
              ) {
                const {roles} = authenticate()
                const canGetContents = isAuthorised(CanGetContents, roles)
                const canGetSharedContents = isAuthorised(CanGetSharedContents, roles)
                if (!(canGetContents || canGetSharedContents)) {
                  throw new NotAuthorisedError()
                }

                return dbAdapter.content.getContents(
                  {
                    type: model.identifier,
                    filter: {...filter, shared: !canGetContents ? true : undefined},
                    sort,
                    order,
                    cursor: InputCursor(after, before),
                    limit: Limit(first, last, skip),
                    language
                  },
                  contextOptions.languageConfig
                )
              }
            }
          }
        })
      ),
      resolve: () => {
        return {}
      }
    }
  })

  const GraphQLContentTypeEnum = new GraphQLEnumType({
    name: 'contentTypeEnum',
    values: contextOptions.contentModels.reduce((accu, item) => {
      accu[`${item.identifier}`] = {
        value: item.identifier
      }
      return accu
    }, {} as GraphQLEnumValueConfigMap)
  })

  const GraphQLContentContextEnum = new GraphQLEnumType({
    name: 'contentContextEnum',
    values: {
      local: {value: 'local'},
      peers: {value: 'peers'}
    }
  })

  const GraphQLContentModelSummary = new GraphQLObjectType<unknown, Context>({
    name: `ContentModelSummary`,
    fields: {
      id: {type: GraphQLNonNull(GraphQLID)},
      title: {type: GraphQLNonNull(GraphQLString)},
      slugI18n: {
        type: GraphQLNonNull(getI18nOutputType(GraphQLString, contextOptions.languageConfig))
      },
      shared: {type: GraphQLNonNull(GraphQLBoolean)},
      contentType: {type: GraphQLNonNull(GraphQLContentTypeEnum)},

      createdAt: {type: GraphQLNonNull(GraphQLDateTime)},
      modifiedAt: {type: GraphQLNonNull(GraphQLDateTime)},

      publicationDate: {type: GraphQLDateTime},
      dePublicationDate: {type: GraphQLDateTime}
    }
  })

  query._all = {
    type: GraphQLNonNull(
      new GraphQLObjectType<undefined, Context>({
        name: `All`,
        fields: {
          list: {
            type: GraphQLNonNull(
              getGraphQLContentConnection(
                'listByType',
                getGraphQLPeerCustomContent('listByType', GraphQLContentModelSummary)
              )
            ),
            args: {
              type: {type: GraphQLNonNull(GraphQLContentTypeEnum)},
              context: {type: GraphQLContentContextEnum},
              language: {type: GraphQLInt},
              after: {type: GraphQLID},
              before: {type: GraphQLID},
              first: {type: GraphQLInt},
              last: {type: GraphQLInt},
              skip: {type: GraphQLInt},
              filter: {type: GraphQLContentFilter},
              sort: {type: GraphQLContentSort, defaultValue: ContentSort.ModifiedAt},
              order: {type: GraphQLSortOrder, defaultValue: SortOrder.Descending}
            },
            async resolve(
              root,
              {type, filter, sort, order, context: argContext, after, before, first, last, skip},
              context,
              info
            ) {
              const {authenticate, loaders, dbAdapter} = context

              if (argContext && argContext === 'peers') {
                const {roles} = authenticate()

                authorise(CanGetPeerContents, roles)

                after = after ? JSON.parse(base64Decode(after)) : null

                const peers = await dbAdapter.peer.getPeers()

                for (const peer of peers) {
                  // Prime loader cache so we don't need to refetch inside `delegateToPeerSchema`.
                  loaders.peer.prime(peer.id, peer)
                }

                const args: Array<ArgumentNode> = [
                  {
                    kind: Kind.ARGUMENT,
                    name: {kind: Kind.NAME, value: 'type'},
                    value: {kind: Kind.ENUM, value: type}
                  },
                  {
                    kind: Kind.ARGUMENT,
                    name: {kind: Kind.NAME, value: 'context'},
                    value: {kind: Kind.ENUM, value: 'local'}
                  }
                ]
                if (before) {
                  args.push({
                    kind: Kind.ARGUMENT,
                    name: {kind: Kind.NAME, value: 'before'},
                    value: {kind: Kind.STRING, value: before}
                  })
                }
                if (after) {
                  args.push({
                    kind: Kind.ARGUMENT,
                    name: {kind: Kind.NAME, value: 'after'},
                    value: {kind: Kind.STRING, value: after}
                  })
                }
                if (first) {
                  args.push({
                    kind: Kind.ARGUMENT,
                    name: {kind: Kind.NAME, value: 'first'},
                    value: {kind: Kind.INT, value: first}
                  })
                }
                if (last) {
                  args.push({
                    kind: Kind.ARGUMENT,
                    name: {kind: Kind.NAME, value: 'last'},
                    value: {kind: Kind.INT, value: last}
                  })
                }

                const contentss = await Promise.all(
                  peers.map(peer => {
                    try {
                      if (after && after[peer.id] == null) return null
                      return delegateToPeerSchema(peer.id, true, context, {
                        info,
                        fieldName: 'content',
                        args: {after: after ? after[peer.id] : undefined},
                        transforms: [
                          new WrapQuery(
                            ['content'],
                            subtree => {
                              return {
                                kind: Kind.SELECTION_SET,
                                selections: [
                                  {
                                    kind: Kind.FIELD,
                                    name: {
                                      kind: Kind.NAME,
                                      value: '_all'
                                    },
                                    selectionSet: {
                                      kind: Kind.SELECTION_SET,
                                      selections: [
                                        {
                                          kind: Kind.FIELD,
                                          name: {kind: Kind.NAME, value: 'list'},
                                          arguments: args,
                                          selectionSet: {
                                            kind: Kind.SELECTION_SET,
                                            selections: [
                                              ...subtree.selections,
                                              {
                                                kind: Kind.FIELD,
                                                name: {kind: Kind.NAME, value: 'pageInfo'},
                                                selectionSet: {
                                                  kind: Kind.SELECTION_SET,
                                                  selections: [
                                                    {
                                                      kind: Kind.FIELD,
                                                      name: {kind: Kind.NAME, value: 'endCursor'}
                                                    },
                                                    {
                                                      kind: Kind.FIELD,
                                                      name: {kind: Kind.NAME, value: 'hasNextPage'}
                                                    }
                                                  ]
                                                }
                                              },
                                              {
                                                kind: Kind.FIELD,
                                                name: {kind: Kind.NAME, value: 'totalCount'}
                                              }
                                            ]
                                          }
                                        }
                                      ]
                                    }
                                  }
                                ]
                              }
                            },
                            result => {
                              return result._all.list
                            }
                          )
                        ]
                      })
                    } catch (err) {
                      return null
                    }
                  })
                )

                const totalCount = contentss.reduce(
                  (prev, result) => prev + (result?.totalCount ?? 0),
                  0
                )

                const cursors = Object.fromEntries(
                  contentss.map((result, index) => [
                    peers[index].id,
                    result?.pageInfo.endCursor ?? null
                  ])
                )

                const hasNextPage = contentss.reduce(
                  (prev, result) => prev || (result?.pageInfo.hasNextPage ?? false),
                  false
                )

                const peerContents = contentss.flatMap<PeerContent>((result, index) => {
                  const peer = peers[index]
                  return (
                    result?.nodes.map((content: any) =>
                      Object.assign(content, {peerID: peer.id})
                    ) ?? []
                  )
                })

                switch (sort) {
                  case ContentSort.CreatedAt:
                    peerContents.sort(
                      (a, b) =>
                        new Date(b.content.createdAt).getTime() -
                        new Date(a.content.createdAt).getTime()
                    )
                    break

                  case ContentSort.ModifiedAt:
                    peerContents.sort(
                      (a, b) =>
                        new Date(b.content.modifiedAt).getTime() -
                        new Date(a.content.modifiedAt).getTime()
                    )
                    break

                  case ContentSort.PublishAt:
                    peerContents.sort(
                      (a, b) =>
                        new Date(b.content.latest.publishAt).getTime() -
                        new Date(a.content.latest.publishAt).getTime()
                    )
                    break

                  case ContentSort.PublishedAt:
                    peerContents.sort(
                      (a, b) =>
                        new Date(b.content.latest.publishedAt).getTime() -
                        new Date(a.content.latest.publishedAt).getTime()
                    )
                    break

                  case ContentSort.UpdatedAt:
                    peerContents.sort(
                      (a, b) =>
                        new Date(b.content.latest.updatedAt).getTime() -
                        new Date(a.content.latest.updatedAt).getTime()
                    )
                    break
                }

                if (order === SortOrder.Ascending) {
                  peerContents.reverse()
                }

                return {
                  nodes: peerContents,
                  totalCount: totalCount,
                  pageInfo: {
                    endCursor: base64Encode(JSON.stringify(cursors)),
                    hasNextPage: hasNextPage
                  }
                }
              }

              const {roles} = authenticate()
              const canGetContents = isAuthorised(CanGetContents, roles)
              const canGetSharedContents = isAuthorised(CanGetSharedContents, roles)

              if (canGetContents || canGetSharedContents) {
                const r = await dbAdapter.content.getContents(
                  {
                    type,
                    filter: {...filter, shared: !canGetContents ? true : undefined},
                    sort,
                    order,
                    cursor: InputCursor(after, before),
                    limit: Limit(first, last, skip)
                  },
                  contextOptions.languageConfig
                )
                r.nodes = r.nodes.map(content => {
                  return {content} as any
                })
                return r
              } else {
                throw new NotAuthorisedError()
              }
            }
          },
          read: {
            type: GraphQLNonNull(GraphQLContentModelSummary),
            args: {
              peerID: {type: GraphQLID},
              id: {type: GraphQLNonNull(GraphQLID)}
            },
            async resolve(root, {peerID, id}, context) {
              if (peerID) {
                const {authenticate} = context
                const {roles} = authenticate()

                authorise(CanGetPeerContent, roles)

                return null // todo
              }

              const {authenticate, loaders} = context
              const {roles} = authenticate()

              const canGetContent = isAuthorised(CanGetContent, roles)
              const canGetSharedContent = isAuthorised(CanGetSharedContent, roles)

              if (canGetContent || canGetSharedContent) {
                const content = await loaders.content.load(id)

                if (canGetContent) {
                  return content
                } else {
                  return content?.shared ? content : null
                }
              } else {
                throw new NotAuthorisedError()
              }
            }
          }
        }
      })
    ),
    resolve: () => {
      return {}
    }
  }

  mutation._all = {
    type: GraphQLNonNull(
      new GraphQLObjectType<undefined, Context>({
        name: `AllMutations`,
        fields: {
          delete: {
            type: GraphQLBoolean,
            args: {id: {type: GraphQLNonNull(GraphQLID)}},
            async resolve(source, {id}, {authenticate, dbAdapter}) {
              const {roles} = authenticate()
              authorise(CanDeleteContent, roles)
              return dbAdapter.content.deleteContent({id})
            }
          },
          publish: {
            type: GraphQLNonNull(GraphQLContentModelSummary),
            args: {
              id: {type: GraphQLNonNull(GraphQLID)},
              publicationDate: {type: GraphQLDateTime}
            },
            async resolve(source, {id, publicationDate}, {business}) {
              return business.publishContent(id, publicationDate)
            }
          },
          unpublish: {
            type: GraphQLNonNull(GraphQLContentModelSummary),
            args: {id: {type: GraphQLNonNull(GraphQLID)}},
            async resolve(root, {id}, {business}) {
              return business.unpublishContent(id)
            }
          }
        }
      })
    ),
    resolve: () => {
      return {}
    }
  }

  return {
    queryPublic: new GraphQLObjectType<undefined, Context>({
      name: nameJoin('content', 'public'),
      fields: queryPublic
    }),
    mutationPublic: undefined,
    queryPrivate: new GraphQLObjectType<undefined, Context>({
      name: 'content',
      fields: query
    }),
    mutationPrivate: new GraphQLObjectType<undefined, Context>({
      name: nameJoin('content', 'mutations'),
      fields: mutation
    })
  }
}
