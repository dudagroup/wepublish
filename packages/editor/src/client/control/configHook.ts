import {useConfigQuery} from '../api'
import {Configs, ContentModelConfigMerged, EditorConfig} from '../interfaces/extensionConfig'

export function useConfig(editorConfig: EditorConfig): Configs | undefined {
  const {data} = useConfigQuery({
    fetchPolicy: 'network-only'
  })

  let configs: Configs | undefined
  if (data) {
    const contentModelExtensionMerged: ContentModelConfigMerged[] = data.config.content.map(
      config => {
        const cfg = editorConfig.contentModelExtension?.find(
          c => c.identifier === config.identifier
        )

        let result = config
        if (cfg) {
          result = Object.assign({}, result, cfg)
        }
        return result
      }
    )

    configs = {
      contentModelExtensionMerged,
      apiConfig: data.config,
      editorConfig
    }
    if (!configs.editorConfig.navigationBar) {
      configs.editorConfig = Object.assign({}, configs.editorConfig, {
        navigationBar: {
          articlesActive: true,
          authorsActive: true,
          commentsActive: true,
          imageLibraryActive: true,
          navigationActive: true,
          pagesActive: true
        }
      })
    }
  }
  return configs
}
