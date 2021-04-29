import React from 'react'
import {Button, Drawer} from 'rsuite'
import {useTranslation} from 'react-i18next'

export interface ArticleMetadataProperty {
  readonly key: string
  readonly value: string
  readonly public: boolean
}

export interface ContentMetadata {
  readonly title: string
  readonly shared: boolean
}

export interface ContentMetadataPanelModalProps {
  readonly children: any
  onClose?(): void
}

export function ContentMetadataPanelModal({children, onClose}: ContentMetadataPanelModalProps) {
  const {t} = useTranslation()

  return (
    <>
      <Drawer.Header>
        <Drawer.Title>{t('articleEditor.panels.metadata')}</Drawer.Title>
      </Drawer.Header>

      <Drawer.Body>{children}</Drawer.Body>

      <Drawer.Footer>
        <Button appearance={'subtle'} onClick={() => onClose?.()}>
          {t('articleEditor.panels.close')}
        </Button>
      </Drawer.Footer>
    </>
  )
}
