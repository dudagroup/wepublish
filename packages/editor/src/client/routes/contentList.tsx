import React, {useEffect, useState} from 'react'
import {
  Link,
  ButtonLink,
  ContentCreateRoute,
  ContentEditRoute,
  ContentListRoute,
  useRouteDispatch,
  useRoute
} from '../route'
import {
  useUnpublishContentMutation,
  useContentListQuery,
  ContentListRefFragment,
  ContentSort,
  ContentTypeEnum
} from '../api'
import {DescriptionList, DescriptionListItem} from '../atoms/descriptionList'
import {useTranslation} from 'react-i18next'
import {
  FlexboxGrid,
  Input,
  InputGroup,
  Icon,
  Table,
  Modal,
  Button,
  Popover,
  Whisper,
  Divider,
  Drawer,
  Checkbox
} from 'rsuite'
import {getDeleteMutation} from '../utils/queryUtils'
import {useMutation} from '@apollo/client'
import {Content} from '@dudagroup/api'
import {RecordPreview} from '../atoms/recordPreview'
import {ReferenceScope} from '../interfaces/contentModelSchema'
import {Reference} from '../interfaces/referenceType'
import {Configs, ContentModelConfigMerged} from '../interfaces/extensionConfig'
import {ContentEditor} from './contentEditor'
import {
  DEFAULT_TABLE_PAGE_SIZES,
  humanReadableDateTime,
  mapTableSortTypeToGraphQLSortOrder
} from '../utility'
import {RouteActionType} from '@karma.run/react'
const {Column, HeaderCell, Cell, Pagination} = Table

enum ConfirmAction {
  Delete = 'delete',
  Unpublish = 'unpublish',
  UnpublishAll = 'UnpublishAll'
}

function mapColumFieldToGraphQLField(columnField: string): ContentSort | null {
  switch (columnField) {
    case 'createdAt':
      return ContentSort.CreatedAt
    case 'modifiedAt':
      return ContentSort.ModifiedAt
    case 'publishAt':
      return ContentSort.PublicationDate
    default:
      return null
  }
}

export interface ArticleEditorProps {
  readonly type: string
  readonly scope?: ReferenceScope
  readonly configs: Configs
  readonly currentContentConfig: ContentModelConfigMerged
  readonly modal?: boolean
  onSelectRef?: (ref: Reference) => void
}

function ContentListView({
  type,
  configs,
  currentContentConfig,
  onSelectRef,
  modal
}: ArticleEditorProps) {
  const [filterState, setFilterState] = useState('')
  const [pageState, setPageState] = useState(1)
  const [isEditModalOpen, setEditModalOpen] = useState(false)
  const [isConfirmationDialogOpen, setConfirmationDialogOpen] = useState(false)
  const [currentContent, setCurrentContent] = useState<Content>()
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>()
  const [limit, setLimit] = useState(10)
  const [sortField, setSortField] = useState('modifiedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectionAll, setSelectionAll] = useState(false)
  const [selection, setSelection] = useState<{[key: number]: boolean}>({})
  const {current} = useRoute()
  const dispatch = useRouteDispatch()
  const filter = modal ? filterState : current?.query?.filter || ''
  const page = modal ? pageState : Number(current?.query?.page || '1')
  const [articles, setArticles] = useState<ContentListRefFragment[]>([])
  const [unpublishArticle, {loading: isUnpublishing}] = useUnpublishContentMutation()
  const [deleteContent, {loading: isDeleting}] = useMutation(
    getDeleteMutation(currentContentConfig)
  )
  const {t} = useTranslation()
  const listVariables = {
    type: type as ContentTypeEnum,
    filter: filter || undefined,
    first: limit,
    skip: page - 1,
    sort: mapColumFieldToGraphQLField(sortField),
    order: mapTableSortTypeToGraphQLSortOrder(sortOrder)
  }

  const {data, loading: isLoading, refetch} = useContentListQuery({
    variables: listVariables,
    fetchPolicy: 'network-only'
  })

  useEffect(() => {
    setSelectionAll(false)
    setSelection({})
    refetch(listVariables)
  }, [filter, page, limit, sortOrder, sortField])

  useEffect(() => {
    if (data?.content._all.list.nodes) {
      setArticles(data?.content._all.list.nodes.map(a => a.content))
    }
  }, [data?.content._all.list])

  useEffect(() => {
    document.title = `${currentContentConfig.namePlural}`
  })

  const rowDeleteButton = (rowData: Content) => {
    const triggerRef = React.createRef<any>()
    const close = () => triggerRef.current.close()
    const speaker = (
      <Popover title={currentContent?.title}>
        <Button
          color="red"
          disabled={isDeleting}
          onClick={() => {
            if (!currentContent) return
            close()
            deleteContent({
              variables: {id: currentContent.id}
            })
              .then(() => {
                refetch()
              })
              .catch(console.error)
          }}>
          {t('global.buttons.deleteNow')}
        </Button>
      </Popover>
    )
    return (
      <>
        <Whisper placement="left" trigger="click" speaker={speaker} ref={triggerRef}>
          <Button
            appearance="link"
            color="red"
            onClick={() => {
              setCurrentContent(rowData)
            }}>
            {' '}
            {t('global.buttons.delete')}{' '}
          </Button>
        </Whisper>
      </>
    )
  }

  function setQueryParam(additionalQueryParams: {[key: string]: string}) {
    const currentQueryParams = current?.query || {}
    dispatch({
      type: RouteActionType.ReplaceRoute,
      route: ContentListRoute.create(
        {type},
        {
          query: {
            ...currentQueryParams,
            ...additionalQueryParams
          }
        }
      )
    })
  }

  return (
    <>
      <FlexboxGrid>
        <FlexboxGrid.Item colspan={16}>
          <h2>{currentContentConfig.namePlural}</h2>
        </FlexboxGrid.Item>
        <FlexboxGrid.Item colspan={8} style={{textAlign: 'right'}}>
          <ButtonLink
            appearance="primary"
            disabled={isLoading}
            onClick={e => {
              if (onSelectRef) {
                e.preventDefault()
                setEditModalOpen(true)
              }
            }}
            route={ContentCreateRoute.create({type})}>
            {`New ${currentContentConfig.nameSingular}`}
          </ButtonLink>
        </FlexboxGrid.Item>
        <FlexboxGrid.Item colspan={24} style={{marginTop: '20px'}}>
          <InputGroup inside>
            <InputGroup.Addon>
              <Icon icon="search" />
            </InputGroup.Addon>
            <Input
              value={filter}
              onChange={value => {
                if (modal) {
                  setFilterState(value)
                  setPageState(1)
                } else {
                  setQueryParam({
                    filter: value,
                    page: '1'
                  })
                }
              }}
            />
            <InputGroup.Button
              onClick={() => {
                if (modal) {
                  setFilterState('')
                  setPageState(1)
                } else {
                  setQueryParam({
                    filter: '',
                    page: '1'
                  })
                }
              }}>
              <Icon icon="close" />
            </InputGroup.Button>
          </InputGroup>
        </FlexboxGrid.Item>
      </FlexboxGrid>

      <Table
        height={currentContentConfig.previewSize === 'big' ? 800 : 510}
        autoHeight
        style={{marginTop: '20px', overflowY: 'auto'}}
        loading={isLoading}
        data={articles}
        rowHeight={currentContentConfig.previewSize === 'big' ? 123 : undefined}
        onSortColumn={(sortColumn, sortType) => {
          // setSortOrder(sortType)
          // setSortField(sortColumn)
          console.log('TODO: implement onSortColumn', sortColumn, sortType)
          setSortField('modifiedAt')
          setSortOrder('asc')
        }}>
        <Column width={40} align="left">
          <HeaderCell></HeaderCell>
          <Cell>
            {(_: ContentListRefFragment, i: number) => {
              return (
                <Checkbox
                  className="list-checkbox"
                  checked={!!selection[i]}
                  onClick={() => {
                    setSelection({...selection, [i]: !selection[i]})
                  }}></Checkbox>
              )
            }}
          </Cell>
        </Column>
        <Column flexGrow={3} align="left">
          <HeaderCell>{t('content.overview.title')}</HeaderCell>
          <Cell>
            {(rowData: ContentListRefFragment) => {
              return (
                <Link
                  route={ContentEditRoute.create({type, id: rowData.id})}
                  onClick={e => {
                    if (onSelectRef) {
                      e.preventDefault()
                      onSelectRef({
                        contentType: type,
                        recordId: rowData.id
                      })
                    }
                  }}>
                  {rowData.title || t('content.overview.untitled')}
                </Link>
              )
            }}
          </Cell>
        </Column>
        {currentContentConfig.previewPath && (
          <Column flexGrow={2} minWidth={120} align="left">
            <HeaderCell>{t('content.overview.preview')}</HeaderCell>
            <Cell>
              {(rowData: ContentListRefFragment) => {
                return <RecordPreview record={rowData}></RecordPreview>
              }}
            </Cell>
          </Column>
        )}
        <Column flexGrow={2} minWidth={140} align="left">
          <HeaderCell>{t('content.overview.created')}</HeaderCell>
          <Cell>
            {(rowData: ContentListRefFragment) => {
              return humanReadableDateTime(rowData.createdAt)
            }}
          </Cell>
        </Column>
        <Column flexGrow={2} minWidth={140} align="left">
          <HeaderCell>{t('content.overview.updated')}</HeaderCell>
          <Cell>
            {(rowData: ContentListRefFragment) => {
              return humanReadableDateTime(rowData.modifiedAt)
            }}
          </Cell>
        </Column>
        <Column flexGrow={2} minWidth={170} align="right">
          <HeaderCell style={{paddingRight: 20}}>{t('content.overview.action')}</HeaderCell>
          <Cell style={{padding: '6px 10px 6px 0'}}>
            {(rowData: Content) => (
              <>
                {rowData.publicationDate && (
                  <Button
                    color="orange"
                    appearance="link"
                    onClick={e => {
                      setCurrentContent(rowData)
                      setConfirmAction(ConfirmAction.Unpublish)
                      setConfirmationDialogOpen(true)
                    }}>
                    {t('global.buttons.unpublish')}
                  </Button>
                )}
                <Divider vertical></Divider>
                {rowDeleteButton(rowData)}
              </>
            )}
          </Cell>
        </Column>
      </Table>
      <FlexboxGrid justify="space-between">
        <FlexboxGrid.Item colspan={12} style={{padding: '10px 0'}}>
          <Checkbox
            style={{paddingLeft: 0, paddingRight: 20, display: 'inline-block'}}
            checked={selectionAll}
            onClick={() => {
              const selected = !selectionAll
              setSelectionAll(selected)

              const s: {[key: number]: boolean} = {}
              for (let i = 0; i < limit; i++) {
                s[i] = selected
              }
              setSelection(s)
            }}>
            Check all
          </Checkbox>
          <Button
            appearance="link"
            color="orange"
            onClick={() => {
              setConfirmAction(ConfirmAction.UnpublishAll)
              setConfirmationDialogOpen(true)
            }}>
            Unpublish
          </Button>
          {/* <Button appearance="link" color="red">
            Delete
          </Button> */}
        </FlexboxGrid.Item>
        <FlexboxGrid.Item colspan={12}>
          <Pagination
            size="xs"
            lengthMenu={DEFAULT_TABLE_PAGE_SIZES}
            activePage={page}
            displayLength={limit}
            total={data?.content._all.list.totalCount}
            onChangePage={page => {
              if (modal) {
                setPageState(page)
              } else {
                setQueryParam({
                  page: String(page)
                })
              }
            }}
            onChangeLength={limit => setLimit(limit)}
          />
        </FlexboxGrid.Item>
      </FlexboxGrid>

      <Modal
        show={isConfirmationDialogOpen && confirmAction !== ConfirmAction.UnpublishAll}
        width={'sm'}
        onHide={() => setConfirmationDialogOpen(false)}>
        <Modal.Header>
          <Modal.Title>
            {confirmAction === ConfirmAction.Unpublish
              ? t('articles.panels.unpublishArticle')
              : t('articles.panels.deleteArticle')}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <DescriptionList>
            <DescriptionListItem label={t('articles.panels.title')}>
              {currentContent?.title || t('articles.panels.untitled')}
            </DescriptionListItem>

            <DescriptionListItem label={t('articles.panels.createdAt')}>
              {currentContent?.createdAt && new Date(currentContent.createdAt).toLocaleString()}
            </DescriptionListItem>
          </DescriptionList>
        </Modal.Body>

        <Modal.Footer>
          <Button
            appearance={'primary'}
            disabled={isUnpublishing || isDeleting}
            onClick={async () => {
              if (!currentContent) return

              switch (confirmAction) {
                case ConfirmAction.Delete:
                  await deleteContent({
                    variables: {id: currentContent.id}
                  })
                  await refetch()
                  break

                case ConfirmAction.Unpublish:
                  await unpublishArticle({
                    variables: {id: currentContent.id}
                  })
                  await refetch()
                  break
              }

              setConfirmationDialogOpen(false)
            }}>
            {t('articles.panels.confirm')}
          </Button>
          <Button onClick={() => setConfirmationDialogOpen(false)} appearance="subtle">
            {t('articles.panels.cancel')}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={isConfirmationDialogOpen && confirmAction === ConfirmAction.UnpublishAll}
        width={'sm'}
        onHide={() => setConfirmationDialogOpen(false)}>
        <Modal.Header>
          <Modal.Title>{t('articles.panels.unpublishArticle')}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <DescriptionList></DescriptionList>
        </Modal.Body>

        <Modal.Footer>
          <Button
            appearance={'primary'}
            disabled={isUnpublishing || isDeleting}
            onClick={async () => {
              switch (confirmAction) {
                case ConfirmAction.UnpublishAll:
                  for (const item of Object.entries(selection)) {
                    const [key, val] = item
                    if (val) {
                      await unpublishArticle({
                        variables: {id: articles[Number(key)].id}
                      })
                    }
                  }

                  await refetch()
                  setSelectionAll(false)
                  setSelection([])
                  break
              }

              setConfirmationDialogOpen(false)
            }}>
            {t('articles.panels.confirm')}
          </Button>
          <Button onClick={() => setConfirmationDialogOpen(false)} appearance="subtle">
            {t('articles.panels.cancel')}
          </Button>
        </Modal.Footer>
      </Modal>

      <Drawer
        show={isEditModalOpen}
        placement={'bottom'}
        backdrop="static"
        full
        onHide={() => setEditModalOpen(false)}>
        <Drawer.Body style={{margin: 0}}>
          <ContentEditor
            onBack={() => setEditModalOpen(false)}
            onApply={ref => {
              setEditModalOpen(false)
              if (onSelectRef) {
                onSelectRef(ref)
              }
            }}
            type={type}
            configs={configs}></ContentEditor>
        </Drawer.Body>
      </Drawer>
    </>
  )
}

export function ContentList({
  type,
  configs,
  onSelectRef,
  modal
}: Omit<ArticleEditorProps, 'currentContentConfig'>) {
  const config = configs?.contentModelExtensionMerged.find(config => {
    return config.identifier === type
  })
  if (config) {
    return (
      <ContentListView
        configs={configs}
        currentContentConfig={config}
        type={type}
        onSelectRef={onSelectRef}
        modal={modal}
      />
    )
  }

  return <h1>Content Type {type} not supported</h1>
}
