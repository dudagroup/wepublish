/* eslint-disable i18next/no-literal-string */
import React, {useState, useEffect, useCallback, useReducer} from 'react'
import {Modal, Notification, Icon, IconButton, Divider} from 'rsuite'
import {RouteActionType} from '@karma.run/react'

import {useRouteDispatch, IconButtonLink, ContentListRoute, ContentEditRoute} from '../route'

import {ContentMetadataPanel, DefaultMetadata} from '../panel/contentMetadataPanel'
import {usePublishContentMutation} from '../api'
import {useUnsavedChangesDialog} from '../unsavedChangesDialog'
import {useTranslation} from 'react-i18next'
import {PublishCustomContentPanel} from '../panel/contentPublishPanel'
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

export interface ArticleEditorProps {
  readonly id?: string
  readonly type: string
  readonly configs: Configs
  readonly onBack?: () => void
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
  content: any
  meta?: any
  __typename: string
}

export function ContentEditor({id, type, configs, onBack}: ArticleEditorProps) {
  const {t} = useTranslation()
  const dispatch = useRouteDispatch()

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
    shared: false
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
  const pendingPublishDate = recordData?.createdAt

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

  console.log(hasChanged, hasChangedCustomMeta, hasChangedContent)
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
      const {shared, title, content, meta} = stripKeysRecursive(recordData, ['__typename'])
      const publishedAt = new Date()
      if (publishedAt) setPublishedAt(new Date(publishedAt))

      setMetadata({
        title,
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
        dispatch({
          type: RouteActionType.ReplaceRoute,
          route: ContentEditRoute.create({type, id: data.content[type].create.id})
        })
      }
      setChanged(false)
      Notification.success({
        title: t('articleEditor.overview.draftCreated'),
        duration: 2000
      })
    }
  }

  async function handlePublish(publishDate: Date, updateDate: Date) {
    if (contentdId) {
      const {data} = await updateContent({
        variables: {id: contentdId, input: createInput()}
      })

      if (data) {
        const {data: publishData} = await publishContent({
          variables: {
            id: contentdId,
            publishAt: publishDate.toISOString(),
            publishedAt: publishDate.toISOString(),
            updatedAt: updateDate.toISOString()
          }
        })

        if (publishData?.content?._all?.publish?.published?.publishedAt) {
          setPublishedAt(new Date(publishData?.content?._all?.publish?.published.publishedAt))
        }
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
      contentConfig
    )
  } else {
    content = (
      <GenericContentView
        record={contentData}
        fields={contentConfig.schema.content}
        languagesConfig={configs.apiConfig.languages}
        dispatch={dispatcher}></GenericContentView>
    )
  }

  let metadataView = null
  if (contentConfig.getMetaView) {
    metadataView = contentConfig.getMetaView(
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
      contentConfig
    )
  } else {
    metadataView = (
      <ContentMetadataPanel
        defaultMetadata={metadata}
        customMetaFields={contentConfig.schema.meta}
        customMetadata={customMetadata}
        customMetadataDispatcher={customMetadataDispatcher}
        languagesConfig={configs.apiConfig.languages}
        onChangeDefaultMetadata={(value: any) => {
          setMetadata(value)
          setChanged(true)
        }}
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
              {metadataView && (
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
            justifyContent: 'left',
            alignItems: 'center',
            width: '100%'
          }}>
          <div
            className="wep-editor-content"
            style={{
              display: 'flex',
              width: '100%',
              maxWidth: 960 + 40,
              paddingTop: 40,
              paddingRight: 40,
              paddingBottom: 60,
              paddingLeft: 40
            }}>
            {content}
          </div>
        </div>
      </div>

      <Modal show={isMetaVisible} full backdrop="static" onHide={() => setMetaVisible(false)}>
        <ContentMetadataPanelModal onClose={() => setMetaVisible(false)}>
          {metadataView}
        </ContentMetadataPanelModal>
      </Modal>

      <Modal show={isPublishDialogOpen} size={'sm'} onHide={() => setPublishDialogOpen(false)}>
        <PublishCustomContentPanel
          initialPublishDate={publishedAt}
          pendingPublishDate={pendingPublishDate}
          metadata={metadata}
          onClose={() => setPublishDialogOpen(false)}
          onConfirm={(publishDate, updateDate) => {
            handlePublish(publishDate, updateDate)
            setPublishDialogOpen(false)
          }}
        />
      </Modal>
    </>
  )
}
