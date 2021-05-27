/* eslint-disable i18next/no-literal-string */
import React, {useEffect, useState} from 'react'
import {Link, ButtonLink, ContentCreateRoute, ContentEditRoute} from '../route'
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
  Drawer
} from 'rsuite'
import {getDeleteMutation} from '../utils/queryUtils'
import {useMutation} from '@apollo/client'
import {Content} from '@wepublish/api'
import {RecordPreview} from '../atoms/recordPreview'
import {ReferenceScope} from '../interfaces/contentModelSchema'
import {Reference} from '../interfaces/referenceType'
import {Configs} from '../interfaces/extensionConfig'
import {ContentEditor} from './contentEditor'
import {
  DEFAULT_TABLE_PAGE_SIZES,
  humanReadableDateTime,
  mapTableSortTypeToGraphQLSortOrder
} from '../utility'
const {Column, HeaderCell, Cell, Pagination} = Table

enum ConfirmAction {
  Delete = 'delete',
  Unpublish = 'unpublish'
}

function mapColumFieldToGraphQLField(columnField: string): ContentSort | null {
  switch (columnField) {
    case 'createdAt':
      return ContentSort.CreatedAt
    case 'modifiedAt':
      return ContentSort.ModifiedAt
    case 'publishAt':
      return ContentSort.PublishAt
    default:
      return null
  }
}

export interface ArticleEditorProps {
  readonly type: string
  readonly scope?: ReferenceScope
  readonly configs: Configs
  onSelectRef?: (ref: Reference) => void
}

export function ContentList({type, configs, onSelectRef}: ArticleEditorProps) {
  const [filter, setFilter] = useState('')
  const [isEditModalOpen, setEditModalOpen] = useState(false)
  const [isConfirmationDialogOpen, setConfirmationDialogOpen] = useState(false)
  const [currentContent, setCurrentContent] = useState<Content>()
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [sortField, setSortField] = useState('modifiedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const config = configs?.contentModelExtensionMerged.find(config => {
    return config.identifier === type
  })
  if (!config) {
    throw Error(`Content type ${type} not supported`)
  }

  const [articles, setArticles] = useState<any[]>([])

  const [unpublishArticle, {loading: isUnpublishing}] = useUnpublishContentMutation()
  const [deleteContent, {loading: isDeleting}] = useMutation(getDeleteMutation(config))

  const rowDeleteButton = (rowData: any) => {
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
    refetch(listVariables)
  }, [filter, page, limit, sortOrder, sortField])

  const {t} = useTranslation()

  useEffect(() => {
    if (data?.content._all.list.nodes) {
      setArticles(data?.content._all.list.nodes.map(a => a.content))
    }
  }, [data?.content._all.list])

  return (
    <>
      <FlexboxGrid>
        <FlexboxGrid.Item colspan={16}>
          <h2>{config.namePlural}</h2>
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
            {`New ${config.nameSingular}`}
          </ButtonLink>
        </FlexboxGrid.Item>
        <FlexboxGrid.Item colspan={24} style={{marginTop: '20px'}}>
          <InputGroup>
            <InputGroup.Addon>
              <Icon icon="search" />
            </InputGroup.Addon>
            <Input value={filter} onChange={value => setFilter(value)} />
          </InputGroup>
        </FlexboxGrid.Item>
      </FlexboxGrid>

      <Table
        virtualized
        height={config.previewSize === 'big' ? 800 : 510}
        style={{marginTop: '20px'}}
        loading={isLoading}
        data={articles}
        rowHeight={config.previewSize === 'big' ? 123 : undefined}
        onSortColumn={(sortColumn, sortType) => {
          // setSortOrder(sortType)
          // setSortField(sortColumn)
          console.log('TODO: implement onSortColumn', sortColumn, sortType)
          setSortField('modifiedAt')
          setSortOrder('asc')
        }}>
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
        <Column flexGrow={2} minWidth={120} align="left">
          <HeaderCell>{t('content.overview.preview')}</HeaderCell>
          <Cell>
            {(rowData: ContentListRefFragment) => {
              return <RecordPreview record={rowData}></RecordPreview>
            }}
          </Cell>
        </Column>
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
        {/* <Column flexGrow={2} align="left">
          <HeaderCell>{t('content.overview.states')}</HeaderCell>
          <Cell>
            {(rowData: PageRefFragment) => {
              const states = []

              if (rowData.draft) states.push(t('content.overview.draft'))
              if (rowData.pending) states.push(t('content.overview.pending'))
              if (rowData.published) states.push(t('content.overview.published'))

              return <div>{states.join(' / ')}</div>
            }}
          </Cell>
        </Column> */}
        <Column width={160} align="right" fixed="right">
          <HeaderCell>{t('content.overview.action')}</HeaderCell>
          <Cell style={{padding: '6px 0'}}>
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

      <Pagination
        style={{height: '50px'}}
        lengthMenu={DEFAULT_TABLE_PAGE_SIZES}
        activePage={page}
        displayLength={limit}
        total={data?.content._all.list.totalCount}
        onChangePage={page => setPage(page)}
        onChangeLength={limit => setLimit(limit)}
      />

      <Modal
        show={isConfirmationDialogOpen}
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

            {/* <DescriptionListItem label={t('articles.panels.updatedAt')}>
              {currentArticle?.updatedAt &&
                new Date(currentArticle.updatedAt).toLocaleString()}
            </DescriptionListItem> */}

            {/* {currentArticle?.publishedAt && (
              <DescriptionListItem label={t('articles.panels.publishedAt')}>
                {new Date(currentArticle.createdAt).toLocaleString()}
              </DescriptionListItem>
            )} */}
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
