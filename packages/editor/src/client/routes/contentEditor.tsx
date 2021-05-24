/* eslint-disable i18next/no-literal-string */
import React, {useState, useEffect, useCallback, useReducer} from 'react'
import {Modal, Notification, Icon, IconButton, Drawer} from 'rsuite'
import {RouteActionType} from '@karma.run/react'

import {useRouteDispatch, IconButtonLink, ContentListRoute, ContentEditRoute} from '../route'

import {ContentMetadataPanel, DefaultMetadata} from '../panel/contentMetadataPanel'
import {usePublishContentMutation} from '../api'
import {useUnsavedChangesDialog} from '../unsavedChangesDialog'
import {useTranslation} from 'react-i18next'
import {PublishContentPanel} from '../panel/contentPublishPanel'
import {useMutation, useQuery} from '@apollo/client'
import {
  getCreateMutation,
  getUpdateMutation,
  getReadQuery,
  stripKeysRecursive
} from '../utils/queryUtils'
import {ContentMetadataPanelModal} from '../panel/contentMetadataPanelModal'

import {GenericContentView} from '../atoms/contentEdit/GenericContentView'
import {ContentEditActionEnum, contentReducer} from '../control/contentReducer'
import {generateEmptyRootContent} from '../control/contentUtil'
import {Configs} from '../interfaces/extensionConfig'
import {Reference} from '../interfaces/referenceType'
import {MapType} from '../interfaces/utilTypes'
import LanguageControl from '../atoms/contentEdit/LanguageControl'

export interface ArticleEditorProps {
  readonly id?: string
  readonly type: string
  readonly configs: Configs
  readonly onBack?: () => void
  readonly onApply?: (ref: Reference) => void
}

interface ContentBody {
  id: string
  createdAt: Date
  modifiedAt: Date
  publicationDate?: Date
  dePublicationDate?: Date
  revision: number
  shared: boolean
  state: string
  title: string
  slugI18n: MapType<string>
  content: any
  meta?: any
  __typename: string
}

export function ContentEditor({id, type, configs, onBack, onApply}: ArticleEditorProps) {
  const {t} = useTranslation()
  const dispatch = useRouteDispatch()
  const [langLaneL, setLangLaneL] = useState(configs.apiConfig.languages.languages[0]?.tag)
  const [langLaneR, setLangLaneR] = useState(configs.apiConfig.languages.languages[1]?.tag)

  const contentConfig = configs.contentModelExtensionMerged.find(config => {
    return config.identifier === type
  })
  if (!contentConfig) {
    throw Error(`Content type ${type} not supported`)
  }

  const [createContent, {loading: isCreating, data: createData, error: createError}] = useMutation(
    getCreateMutation(configs, contentConfig)
  )

  const [updateContent, {loading: isUpdating, error: updateError}] = useMutation(
    getUpdateMutation(configs, contentConfig)
  )

  const [publishContent, {loading: isPublishing, error: publishError}] = usePublishContentMutation({
    fetchPolicy: 'no-cache'
  })

  const [isMetaVisible, setMetaVisible] = useState(false)
  const [isPublishDialogOpen, setPublishDialogOpen] = useState(false)

  const [publishedAt, setPublishedAt] = useState<Date>()
  const [metadata, setMetadata] = useState<DefaultMetadata>({
    title: '',
    shared: false,
    slugI18n: configs.apiConfig.languages.languages.reduce((accu, lang) => {
      accu[lang.tag] = ''
      return accu
    }, {} as MapType<string>)
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

  const contentdId = id || createData?.content[type].create.id

  const isNew = id === undefined
  const {data, loading: isLoading} = useQuery(getReadQuery(configs, contentConfig), {
    skip: isNew || createData != null,
    errorPolicy: 'all',
    fetchPolicy: 'no-cache',
    variables: {id: contentdId!}
  })

  const isNotFound = data && !data.content
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
      const {shared, title, slugI18n, content, meta} = stripKeysRecursive(recordData, [
        '__typename'
      ])
      const publishedAt = new Date()
      if (publishedAt) setPublishedAt(new Date(publishedAt))

      setMetadata({
        title,
        slugI18n,
        shared
      })
      setCustomMetadata(meta)
      setContentData(content)
    }
  }, [recordData])

  useEffect(() => {
    if (createError || updateError || publishError) {
      Notification.error({
        title: updateError?.message ?? createError?.message ?? publishError!.message,
        duration: 5000
      })
    }
  }, [createError, updateError, publishError])

  function createInput(): any {
    const content = stripKeysRecursive(contentData, ['__typename', '__ephemeralReactStateMeta'])
    let meta
    if (customMetadata) {
      const {__typename: waste, ...rest} = customMetadata
      meta = rest
    }

    return {
      id: contentdId,
      title: metadata.title,
      slugI18n: metadata.slugI18n,
      shared: metadata.shared,
      content,
      meta
    }
  }

  async function handleSave() {
    const input = createInput()
    if (contentdId) {
      await updateContent({variables: {input}})

      setChanged(false)
      Notification.success({
        title: t('articleEditor.overview.draftSaved'),
        duration: 2000
      })
    } else {
      const {data} = await createContent({variables: {input}})

      if (data) {
        if (onApply) {
          onApply({
            contentType: type,
            recordId: data.content[type].create.id
          })
        } else {
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

  async function handlePublish(publishDate: Date) {
    if (contentdId) {
      const {data} = await updateContent({
        variables: {id: contentdId, input: createInput()}
      })

      if (data) {
        await publishContent({
          variables: {
            id: contentdId,
            publicationDate: publishDate.toISOString()
          }
        })
      }

      setChanged(false)
      Notification.success({
        title: t('articleEditor.overview.articlePublished'),
        duration: 2000
      })
    }
  }

  useEffect(() => {
    if (isNotFound) {
      Notification.error({
        title: t('articleEditor.overview.notFound'),
        duration: 5000
      })
    }
  }, [isNotFound])

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
        langLaneR={langLaneR}></GenericContentView>
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
            <IconButtonLink
              size={'lg'}
              appearance="subtle"
              style={{
                marginLeft: '30px'
              }}
              icon={<Icon icon="angle-left" />}
              route={ContentListRoute.create({type})}
              onClick={e => {
                if (!unsavedChangesDialog()) e.preventDefault()
                if (onBack) {
                  e.preventDefault()
                  onBack()
                }
              }}>
              {t('articleEditor.overview.back')}
            </IconButtonLink>
            <>
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
              <div className="wep-navi-publishcontrols">
                {isNew && createData == null ? (
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
              position: 'fixed',
              paddingTop: 10,
              top: 42,
              boxShadow: '0 5px 13px -14px #888',
              background: '#fff',
              zIndex: 100
            }}>
            {header}
          </div>
          <div
            className="wep-editor-metalight"
            style={{
              width: '100%',
              maxWidth: 1140,
              marginTop: 60,
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
              marginRight: 30
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
          initialPublishDate={publishedAt}
          pendingPublishDate={recordData?.publicationDate}
          metadata={metadata}
          onClose={() => setPublishDialogOpen(false)}
          onConfirm={publishDate => {
            handlePublish(publishDate)
            setPublishDialogOpen(false)
          }}
        />
      </Modal>
    </>
  )
}
