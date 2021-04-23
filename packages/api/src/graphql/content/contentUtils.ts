export const ContentModelPrefix = '_cm'
export const ContentModelPrefixPrivate = '_cmp'
export const ContentModelPrefixPrivateInput = '_cmpi'
const SEPARATOR = '_'

export function nameJoin(...slug: string[]) {
  return slug.join(SEPARATOR)
}
