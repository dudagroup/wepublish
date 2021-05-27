import React, {useState} from 'react'
import {DefaultMetadata} from './contentMetadataPanel'
import {useTranslation} from 'react-i18next'
import {Button, ControlLabel, DatePicker, Form, FormGroup, Message, Modal} from 'rsuite'
import {DescriptionList, DescriptionListItem} from '../atoms/descriptionList'

export interface PublishArticlePanelProps {
  publicationDate?: string
  dePublicationDate?: string
  metadata: DefaultMetadata

  onClose(): void
  onConfirm(publishDate: Date, depublishDate?: Date): void
}

export function PublishContentPanel({
  publicationDate,
  dePublicationDate,
  metadata,
  onClose,
  onConfirm
}: PublishArticlePanelProps) {
  const now = new Date()
  const initialPublishDate = publicationDate ? new Date(publicationDate) : now
  const [publishDate, setPublishDate] = useState<Date>(initialPublishDate)
  const [dePublishDate, setDePublishDate] = useState<Date | undefined>(
    dePublicationDate ? new Date(dePublicationDate) : undefined
  )
  const {t} = useTranslation()
  let warning = null
  if (initialPublishDate && initialPublishDate.getTime() > now.getTime()) {
    warning = (
      <>
        <Message
          type="warning"
          description={t('articleEditor.panels.articlePending', {
            pendingPublishDate: initialPublishDate
          })}
        />
        <br />
        <br />
      </>
    )
  }
  return (
    <>
      <Modal.Header>
        <Modal.Title>{t('articleEditor.panels.publishArticle')}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {warning}
        <Form fluid={true}>
          <FormGroup>
            <ControlLabel>{t('articleEditor.panels.publishDate')}</ControlLabel>
            <DatePicker
              block
              value={publishDate}
              cleanable={false}
              format="YYYY-MM-DD HH:mm"
              ranges={[
                {
                  label: 'Now',
                  value: new Date()
                }
              ]}
              onChange={publishDate => setPublishDate(publishDate)}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{t('articleEditor.panels.depublishDate')}</ControlLabel>
            <DatePicker
              block
              value={dePublishDate}
              cleanable={true}
              format="YYYY-MM-DD HH:mm"
              ranges={[
                {
                  label: 'Now',
                  value: new Date()
                }
              ]}
              onChange={dePublishDate => setDePublishDate(dePublishDate)}
            />
          </FormGroup>
        </Form>

        <DescriptionList>
          <DescriptionListItem label={t('articleEditor.panels.title')}>
            {metadata.title || '-'}
          </DescriptionListItem>
          <DescriptionListItem label={t('articleEditor.panels.sharedWithPeers')}>
            {metadata.shared ? t('articleEditor.panels.yes') : t('articleEditor.panels.no')}
          </DescriptionListItem>
        </DescriptionList>
      </Modal.Body>

      <Modal.Footer>
        <Button
          appearance="primary"
          disabled={!publishDate}
          onClick={() => onConfirm(publishDate, dePublishDate)}>
          {t('articleEditor.panels.confirm')}
        </Button>
        <Button appearance="subtle" onClick={() => onClose()}>
          {t('articleEditor.panels.close')}
        </Button>
      </Modal.Footer>
    </>
  )
}
