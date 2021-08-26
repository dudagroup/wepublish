import React, {useState, useEffect, useCallback, useReducer} from 'react'
import {Modal, Notification, Icon, IconButton, Drawer, ButtonToolbar, Button, Loader} from 'rsuite'
import {RouteActionType} from '@karma.run/react'
import {useRouteDispatch, ContentEditRoute} from '../route'
import {ContentMetadataPanel, DefaultMetadata} from '../panel/contentMetadataPanel'
import {usePreviewContentQuery, usePublishContentMutation} from '../api'
import {useUnsavedChangesDialog} from '../unsavedChangesDialog'
import {useTranslation} from 'react-i18next'
import {PublishContentPanel} from '../panel/contentPublishPanel'
import {useLazyQuery, useMutation} from '@apollo/client'
import {
  getCreateMutation,
  getUpdateMutation,
  getReadQuery,
  stripKeysRecursive,
  validateRecursive
} from '../utils/queryUtils'
import {ContentMetadataPanelModal} from '../panel/contentMetadataPanelModal'

import {GenericContentView} from '../atoms/contentEdit/GenericContentView'
import {ContentEditActionEnum, contentReducer} from '../control/contentReducer'
import {generateEmptyRootContent} from '../control/contentUtil'
import {Configs, ContentModelConfigMerged} from '../interfaces/extensionConfig'
import {Reference} from '../interfaces/referenceType'
import {MapType} from '../interfaces/utilTypes'
import LanguageControl from '../atoms/contentEdit/LanguageControl'
import {ContentModelSchemaTypes} from '../interfaces/contentModelSchema'
import {AVAILABLE_LANG, useStickyState} from '../base'

export interface ArticleEditorProps {
  readonly id?: string
  readonly type: string
  readonly configs: Configs
  readonly contentConfig: ContentModelConfigMerged
  readonly onBack?: () => void
  readonly onApply?: (ref: Reference) => void
}

export interface ContentBody {
  id: string
  contentType: string
  createdAt: string
  modifiedAt: string
  publicationDate?: string
  dePublicationDate?: string
  revision: number
  shared: boolean
  state: string
  title: string
  slugI18n: MapType<string>
  isActiveI18n: MapType<boolean>
  content: any
  meta?: any
  __typename: string
}

function ContentEditorView({
  id,
  type,
  configs,
  contentConfig,
  onBack,
  onApply
}: ArticleEditorProps) {
  const {t} = useTranslation()
  const dispatch = useRouteDispatch()
  const [langLaneL, setLangLaneL] = useState(configs.apiConfig.languages.languages[0]?.tag)
  const [langLaneR, setLangLaneR] = useState(configs.apiConfig.languages.languages[1]?.tag)
  const [uiLanguage] = useStickyState(AVAILABLE_LANG[0].id, 'wepublish/language')

  const [createContent, {loading: isCreating, data: createData, error: createError}] = useMutation(
    getCreateMutation(configs, contentConfig)
  )

  const [updateContent, {loading: isUpdating, error: updateError}] = useMutation(
    getUpdateMutation(configs, contentConfig)
  )

  const [publishContent, {loading: isPublishing, error: publishError}] = usePublishContentMutation({
    fetchPolicy: 'no-cache'
  })

  const {data: previewToken} = usePreviewContentQuery({
    fetchPolicy: 'no-cache'
  })

  const [isMetaVisible, setMetaVisible] = useState(false)
  const [isPublishDialogOpen, setPublishDialogOpen] = useState(false)

  const [metadata, setMetadata] = useState<DefaultMetadata>({
    title: '',
    shared: false,
    slugI18n: configs.apiConfig.languages.languages.reduce((accu, lang) => {
      accu[lang.tag] = ''
      return accu
    }, {} as MapType<string>),
    isActiveI18n: configs.apiConfig.languages.languages.reduce((accu, lang) => {
      accu[lang.tag] = true
      return accu
    }, {} as MapType<boolean>)
  })

  const intitialCustomMetadata =
    contentConfig.defaultMeta ??
    generateEmptyRootContent(contentConfig.schema.meta, configs.apiConfig.languages)
  const [
    {record: customMetadata, hasChanged: hasChangedCustomMeta},
    customMetadataDispatcher
  ] = useReducer(contentReducer, {
    record: intitialCustomMetadata,
    hasChanged: false
  })
  function setCustomMetadata(value: unknown) {
    customMetadataDispatcher({
      type: ContentEditActionEnum.setInitialState,
      value
    })
  }

  const intitialContent =
    contentConfig.defaultContent ??
    generateEmptyRootContent(contentConfig.schema.content, configs.apiConfig.languages)
  const [{record: contentData, hasChanged: hasChangedContent}, dispatcher] = useReducer(
    contentReducer,
    {
      record: intitialContent,
      hasChanged: false
    }
  )

  function setContentData(value: unknown) {
    dispatcher({
      type: ContentEditActionEnum.setInitialState,
      value
    })
  }

  const [fetch, {data, loading: isLoading}] = useLazyQuery(getReadQuery(configs, contentConfig), {
    errorPolicy: 'all',
    fetchPolicy: 'no-cache'
  })

  const contentdId = id || data?.content?.[type]?.read?.id
  const isNew = !contentdId

  useEffect(() => {
    if (contentdId) {
      setCustomMetadata(intitialCustomMetadata)
      setContentData(intitialContent)
      fetch({
        variables: {id: contentdId}
      })
    }
  }, [contentdId])

  const isNotFound = data?.content[type] && !data?.content[type]?.read
  const recordData: ContentBody = data?.content[type]?.read

  const isDisabled = isLoading || isCreating || isUpdating || isPublishing || isNotFound

  const [hasChanged, setHasChanged] = useState(false)
  function setChanged(val: boolean) {
    setHasChanged(val)
    dispatcher({
      type: ContentEditActionEnum.hasChanged,
      value: val
    })
    customMetadataDispatcher({
      type: ContentEditActionEnum.hasChanged,
      value: val
    })
  }

  const unsavedChangesDialog = useUnsavedChangesDialog(
    hasChanged || hasChangedCustomMeta || hasChangedContent
  )

  const handleChange = useCallback(
    (contentData: React.SetStateAction<any>) => {
      setContentData(contentData)
    },
    [id]
  )

  useEffect(() => {
    if (recordData) {
      const {shared, title, slugI18n, isActiveI18n, content, meta} = stripKeysRecursive(
        recordData,
        ['__typename']
      )

      setMetadata({
        title,
        slugI18n,
        isActiveI18n,
        shared
      })
      setCustomMetadata(meta)
      setContentData(content)
      document.title = `Edit ${type} - ${title}`
    }
  }, [recordData])

  useEffect(() => {
    if (createError || updateError || publishError) {
      Notification.error({
        title: 'Operation was not successful',
        duration: 0,
        description: (
          <p style={{width: 320, lineBreak: 'loose', whiteSpace: 'pre-line'}}>
            {updateError?.message ?? createError?.message ?? publishError?.message}
          </p>
        )
      })
    }
  }, [createError, updateError, publishError])

  function createInput(): any {
    if (!contentConfig) {
      return
    }

    let content
    let meta

    try {
      content = validateRecursive(
        {},
        {
          type: ContentModelSchemaTypes.object,
          fields: contentConfig.schema.content
        },
        stripKeysRecursive(contentData, ['__typename', '__ephemeralReactStateMeta'])
      )

      if (customMetadata) {
        const {__typename: waste, ...rest} = customMetadata

        meta = validateRecursive(
          {},
          {
            type: ContentModelSchemaTypes.object,
            fields: contentConfig.schema.meta
          },
          stripKeysRecursive(rest, ['__typename', '__ephemeralReactStateMeta'])
        )
      }
    } catch (error) {
      console.error(error)
      Notification.error({
        title: 'Operation was not successful',
        duration: 0,
        description: (
          <p style={{width: 320, lineBreak: 'loose', whiteSpace: 'pre-line'}}>{error.message}</p>
        )
      })
      return
    }

    return {
      id: contentdId,
      title: metadata.title,
      slugI18n: metadata.slugI18n,
      isActiveI18n: metadata.isActiveI18n,
      shared: metadata.shared,
      content,
      meta
    }
  }

  async function handleSave() {
    const input = createInput()
    if (!input) {
      return
    }
    if (contentdId) {
      try {
        await updateContent({variables: {input}})
      } catch (error) {
        return
      }

      setChanged(false)
      Notification.success({
        title: t('articleEditor.overview.draftSaved'),
        duration: 2000
      })
    } else {
      let result
      try {
        result = await createContent({variables: {input}})
      } catch (error) {
        return
      }

      const {data} = result
      if (data) {
        await fetch({
          variables: {id: data.content[type].create.id!}
        })
        if (!onApply) {
          dispatch({
            type: RouteActionType.ReplaceRoute,
            route: ContentEditRoute.create({type, id: data.content[type].create.id})
          })
        }
      }
      setChanged(false)
      Notification.success({
        title: t('articleEditor.overview.draftCreated'),
        duration: 2000
      })
    }
  }

  async function handlePreview() {
    if (contentConfig?.getPreviewLink && previewToken?.content._all.previewToken) {
      const url = contentConfig.getPreviewLink(
        previewToken?.content._all.previewToken,
        langLaneL,
        recordData
      )
      if (url) {
        window.open(url, '_blank')
      }
    }
  }

  async function handlePublish(publicationDate: Date, dePublicationDate?: Date) {
    if (contentdId) {
      if (data) {
        await publishContent({
          variables: {
            id: contentdId,
            publicationDate: publicationDate.toISOString(),
            dePublicationDate: dePublicationDate ? dePublicationDate.toISOString() : undefined
          }
        })

        await fetch({variables: {id: contentdId}})

        setChanged(false)
        Notification.success({
          title: t('articleEditor.overview.articlePublished'),
          duration: 2000
        })
      }
    }
  }

  useEffect(() => {
    if (isNotFound) {
      Notification.error({
        title: t('articleEditor.overview.notFound')
      })
    }
  }, [isNotFound])

  if (isLoading) {
    return <Loader center content="loading..." />
  }

  let content = null
  if (contentConfig.getContentView) {
    content = contentConfig.getContentView(
      contentData,
      handleChange,
      isLoading || isDisabled,
      dispatcher,
      configs,
      contentConfig,
      langLaneL,
      langLaneR
    )
  } else {
    content = (
      <GenericContentView
        configs={configs}
        record={contentData}
        fields={contentConfig.schema.content}
        languagesConfig={configs.apiConfig.languages}
        dispatch={dispatcher}
        langLaneL={langLaneL}
        langLaneR={langLaneR}
        langUi={uiLanguage}></GenericContentView>
    )
  }

  let customMetadataView = null
  if (contentConfig.getMetaView) {
    customMetadataView = contentConfig.getMetaView(
      metadata,
      customMetadata,
      value => {
        setMetadata(value)
        setChanged(true)
      },
      (value: any) => {
        setCustomMetadata(value)
      },
      customMetadataDispatcher,
      configs,
      contentConfig,
      langLaneL,
      langLaneR
    )
  } else if (contentConfig.schema.meta && customMetadataDispatcher) {
    customMetadataView = (
      <GenericContentView
        configs={configs}
        record={customMetadata}
        fields={contentConfig.schema.meta}
        languagesConfig={configs.apiConfig.languages}
        dispatch={customMetadataDispatcher}
        langLaneL={langLaneL}
        langLaneR={langLaneR}
        langUi={uiLanguage}
        presentLanguageControl={true}></GenericContentView>
    )
  }

  let header
  if (configs.apiConfig.languages.languages.length >= 2) {
    header = (
      <LanguageControl
        languagesConfig={configs.apiConfig.languages}
        langLaneL={langLaneL}
        langLaneR={langLaneR}
        setLangLaneL={setLangLaneL}
        setLangLaneR={setLangLaneR}
      />
    )
  }

  return (
    <>
      <div
        className="wep-editor-container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          minHeight: '100%'
        }}>
        <div
          className="wep-editor-navigation"
          style={{
            display: 'flex',
            position: 'sticky',
            justifyContent: 'center',
            top: 0,
            zIndex: 10,
            background: '#f7f7fa',
            width: '100%'
          }}>
          <div
            className="wep-editor-navigation-content"
            style={{
              display: 'flex',
              width: 1260,
              justifyContent: 'space-between'
            }}>
            <IconButton
              size={'lg'}
              appearance="subtle"
              style={{
                marginLeft: '30px'
              }}
              icon={<Icon icon="angle-left" />}
              // route={ContentListRoute.create({type})}
              onClick={e => {
                e.preventDefault()
                if (!unsavedChangesDialog()) {
                  return
                }

                if (onBack) {
                  onBack()
                } else {
                  history.back()
                }
              }}>
              {t('articleEditor.overview.back')}
            </IconButton>
            <>
              <div className="wep-navi-publishcontrols">
                {customMetadataView && (
                  <IconButton
                    icon={<Icon icon="file-text-o" />}
                    appearance="subtle"
                    size={'lg'}
                    disabled={isDisabled}
                    onClick={() => setMetaVisible(true)}>
                    {t('articleEditor.overview.metadata')}
                  </IconButton>
                )}
                {isNew == null ? (
                  <IconButton
                    style={{
                      marginLeft: '20px'
                    }}
                    appearance="subtle"
                    size={'lg'}
                    icon={<Icon icon="magic" />}
                    disabled={isDisabled}
                    onClick={() => handleSave()}>
                    {t('articleEditor.overview.create')}
                  </IconButton>
                ) : (
                  <>
                    {contentConfig.getPreviewLink && (
                      <IconButton
                        style={{
                          marginLeft: '20px'
                        }}
                        appearance="subtle"
                        size={'lg'}
                        icon={<Icon icon="eye" />}
                        disabled={isDisabled}
                        onClick={() => handlePreview()}>
                        {'Preview'}
                      </IconButton>
                    )}

                    <IconButton
                      style={{
                        marginLeft: '20px'
                      }}
                      appearance="subtle"
                      size={'lg'}
                      icon={<Icon icon="save" />}
                      disabled={isDisabled}
                      onClick={() => handleSave()}>
                      {t('articleEditor.overview.save')}
                    </IconButton>

                    {!!contentdId && (
                      <IconButton
                        style={{
                          marginLeft: '20px'
                        }}
                        appearance="subtle"
                        size={'lg'}
                        icon={<Icon icon="file-upload" />}
                        disabled={isDisabled}
                        onClick={() => setPublishDialogOpen(true)}>
                        {t('articleEditor.overview.publish')}
                      </IconButton>
                    )}

                    {!!onApply && !!contentdId && (
                      <IconButton
                        size={'lg'}
                        appearance="subtle"
                        icon={<Icon icon="dot-circle-o" />}
                        onClick={e => {
                          e.preventDefault()
                          if (!recordData?.publicationDate) {
                            Notification.open({
                              title: t('content.panels.contentNotPublishedYet'),
                              duration: 200000,
                              description: (
                                <div>
                                  <ButtonToolbar>
                                    <Button
                                      onClick={() => {
                                        Notification.close()
                                        setPublishDialogOpen(true)
                                      }}>
                                      {t('global.buttons.publish')}
                                    </Button>
                                    <Button
                                      onClick={() => {
                                        onApply({
                                          contentType: type,
                                          recordId: contentdId
                                        })
                                      }}>
                                      {t('content.panels.apply')}
                                    </Button>
                                  </ButtonToolbar>
                                </div>
                              )
                            })
                          } else {
                            onApply({
                              contentType: type,
                              recordId: contentdId
                            })
                          }
                        }}>
                        {t('content.panels.apply')}
                      </IconButton>
                    )}
                  </>
                )}
              </div>
            </>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%'
          }}>
          <div
            className="wep-editor-langcontrol"
            style={{
              width: '100%',
              maxWidth: 1140,
              position: 'sticky',
              borderRadius: 60,
              paddingTop: 0,
              paddingLeft: 10,
              paddingRight: 10,
              top: 52,
              boxShadow: '0 5px 13px -14px #888',
              background: '#f2faff',
              border: '1px solid rgba(22, 117, 224, 0.3)',
              zIndex: 10
            }}>
            {header}
          </div>
          <div
            className="wep-editor-metalight"
            style={{
              width: '98vw',
              maxWidth: 1140,
              marginTop: 20,
              border: '1px dashed #e5e5ea',
              background: '#fcfcfc',
              borderRadius: 6
            }}>
            <ContentMetadataPanel
              langLanes={[langLaneL, langLaneR]}
              meta={customMetadata}
              config={contentConfig}
              content={contentData}
              defaultMetadata={metadata}
              onChangeDefaultMetadata={(value: any) => {
                setMetadata(value)
                setChanged(true)
              }}
            />
          </div>
          <div
            className="wep-editor-content"
            style={{
              paddingTop: 20,
              paddingBottom: 20,
              marginLeft: 30,
              marginRight: 30,
              width: '98vw',
              maxWidth: 1140
            }}>
            {content}
          </div>
        </div>
      </div>

      <Drawer
        show={isMetaVisible}
        placement={'bottom'}
        full
        backdrop="static"
        onHide={() => setMetaVisible(false)}>
        <ContentMetadataPanelModal onClose={() => setMetaVisible(false)}>
          {customMetadataView}
        </ContentMetadataPanelModal>
      </Drawer>

      <Modal show={isPublishDialogOpen} size={'sm'} onHide={() => setPublishDialogOpen(false)}>
        <PublishContentPanel
          publicationDate={recordData?.publicationDate}
          dePublicationDate={recordData?.dePublicationDate}
          metadata={metadata}
          onClose={() => setPublishDialogOpen(false)}
          onConfirm={(publishDate, dePublishDate) => {
            handlePublish(publishDate, dePublishDate)
            setPublishDialogOpen(false)
          }}
        />
      </Modal>
    </>
  )
}

export function ContentEditor({
  id,
  type,
  configs,
  onBack,
  onApply
}: Omit<ArticleEditorProps, 'contentConfig'>) {
  const {t} = useTranslation()
  const config = configs?.contentModelExtensionMerged.find(config => {
    return config.identifier === type
  })

  if (config) {
    return (
      <ContentEditorView
        configs={configs}
        contentConfig={config}
        type={type}
        id={id}
        onBack={onBack}
        onApply={onApply}
      />
    )
  }

  return <h1>{t('content.panels.errorUnsuportedContentType', {type: type})}</h1>
}
