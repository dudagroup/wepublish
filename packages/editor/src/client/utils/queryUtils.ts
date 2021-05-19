import {
  ContentModel,
  ContentModelSchema,
  ContentModelSchemaFieldLeaf,
  ContentModelSchemas
} from '@wepublish/api'
import gql from 'graphql-tag'
import {ContentModelSchemaTypes} from '../interfaces/contentModelSchema'
import {Configs} from '../interfaces/extensionConfig'

export const ContentModelPrefix = '_cm'
export const ContentModelPrefixPrivate = '_cmp'
export const ContentModelPrefixPrivateInput = '_cmpi'
const SEPARATOR = '_'

export function nameJoin(...slug: string[]) {
  return slug.join(SEPARATOR)
}

export function getDeleteMutation(schema: ContentModel) {
  return gql`
    mutation DeleteContent_${schema.identifier}($id: ID!) {
      content {
        ${schema.identifier} {
          delete(id: $id)
        }
      }
    }
  `
}

function getFragmentSchemaRecursive(
  configs: Configs,
  schema: ContentModelSchemas,
  name = ''
): string {
  switch (schema.type) {
    case ContentModelSchemaTypes.object:
      return `{
        ${Object.entries(schema.fields)
          .map(([key, val]) => {
            const ObjectName = nameJoin(name, key)
            return `${key} ${getFragmentSchemaRecursive(configs, val, ObjectName)}`
          })
          .join('\n')}
      }`
    case ContentModelSchemaTypes.list:
      return getFragmentSchemaRecursive(configs, schema.contentType, name)
    case ContentModelSchemaTypes.reference: {
      const q = `{
          recordId
          contentType
          peerId
        }`
      if ((schema as ContentModelSchemaFieldLeaf).i18n) {
        return `{${configs.apiConfig.languages.languages.map(v => `${v.tag} ${q}`).join('\n')}}`
      }
      return q
    }
    case ContentModelSchemaTypes.media: {
      const q = `{
        focalPoint {
          x
          y
        }
        media {
          id
          createdAt
          modifiedAt
          filename
          fileSize
          extension
          mimeType
          url
          transformURL
          image {
            format
            width
            height
          }
        }
      }`
      if ((schema as ContentModelSchemaFieldLeaf).i18n) {
        return `{${configs.apiConfig.languages.languages.map(v => `${v.tag} ${q}`).join('\n')}}`
      }
      return q
    }
    case ContentModelSchemaTypes.union:
      return `{
        ${Object.entries(schema.cases)
          .map(([unionCase, val]) => {
            const unionCaseName = nameJoin(name, unionCase)
            return `... on ${unionCaseName} {
              ${unionCase} ${getFragmentSchemaRecursive(configs, val, unionCaseName)}
            }`
          })
          .join('\n')}
      }`
    default:
      if ((schema as ContentModelSchemaFieldLeaf).i18n) {
        return `{${configs.apiConfig.languages.languages.map(v => v.tag).join('\n')}}`
      }
      return ''
  }
}

function getFragmentSchema(
  configs: Configs,
  contentModelSchemas: ContentModelSchema,
  fragmentName: string
) {
  return Object.entries(contentModelSchemas).reduce((accu, [key, val]) => {
    const n = nameJoin(fragmentName, key)
    const children = Object.entries(val).reduce((accu, [key, val]) => {
      accu += `${key} ${getFragmentSchemaRecursive(
        configs,
        val as ContentModelSchemas,
        nameJoin(n, key)
      )}\n`
      return accu
    }, '')

    accu += `${key} {\n${children}}`
    return accu
  }, '')
}

function getFragment(configs: Configs, schema: ContentModel) {
  const fragmentName = nameJoin(ContentModelPrefixPrivate, schema.identifier, 'record')
  const fragment = `
    fragment Content_${schema.identifier} on ${fragmentName} {
      id
      createdAt
      modifiedAt
      publicationDate
      dePublicationDate
      title
      slugI18n {
        ${configs.apiConfig.languages.languages.map(v => `${v.tag}`).join('\n')}
      }
      shared
      ${getFragmentSchema(configs, schema.schema, fragmentName)}
    }
  `
  return fragment
}

export function getCrudQueries(schema: ContentModel) {
  return {
    delete: getDeleteMutation(schema)
  }
}

export function getCreateMutation(configs: Configs, schema: ContentModel) {
  return gql`
  ${getFragment(configs, schema)}

  mutation CreateContent_${schema.identifier}($input: ${nameJoin(
    ContentModelPrefixPrivateInput,
    schema.identifier,
    'record',
    'create'
  )}!) {
    content {
      ${schema.identifier} {
        create(input: $input) {
          ...Content_${schema.identifier}
        }
      }
    }
  }
  `
}

export function getReadQuery(configs: Configs, schema: ContentModel) {
  return gql`
  ${getFragment(configs, schema)}

    query ReadContent_${schema.identifier}($id: ID!) {
      content {
        ${schema.identifier} {
          read(id: $id) {
            ...Content_${schema.identifier}
          }
        }
      }
    }
  `
}

export function getUpdateMutation(configs: Configs, schema: ContentModel) {
  return gql`
  ${getFragment(configs, schema)}

  mutation UpdateContent_${schema.identifier}($input: ${nameJoin(
    ContentModelPrefixPrivateInput,
    schema.identifier,
    'record',
    'update'
  )}!) {
    content {
      ${schema.identifier} {
        update(input: $input) {
          ...Content_${schema.identifier}
        }
      }
    }
  }  
  `
}

export function stripKeysRecursive<T>(input: T, keys: string[]) {
  if (typeof input === 'string' || input instanceof String || input instanceof File) {
    return input
  }
  const copy = {...input}
  for (const prop in copy) {
    if (keys.some(v => v === prop)) delete copy[prop]
    else if (copy[prop] === null) {
    } else if (Array.isArray(copy[prop])) {
      copy[prop] = (copy[prop] as any).map((item: any) => stripKeysRecursive(item, keys))
    } else if (typeof copy[prop] === 'object') {
      copy[prop] = stripKeysRecursive(copy[prop], keys)
    }
  }

  return copy
}
