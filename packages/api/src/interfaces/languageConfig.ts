export interface LanguageConfig {
  defaultLanguageTag: string
  languages: LanguageConfigItem[]
}

export interface LanguageConfigItem {
  tag: string // https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2 (IETF language tags)
  description: string
}
