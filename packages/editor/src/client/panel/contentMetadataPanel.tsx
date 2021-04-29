/* eslint-disable i18next/no-literal-string */
import React from 'react'
import {ControlLabel, Form, FormControl, FormGroup, Toggle, Panel} from 'rsuite'
import {useTranslation} from 'react-i18next'

export interface DefaultMetadata {
  readonly title: string
  readonly shared: boolean
}

export interface ContentMetadataPanelProps {
  readonly defaultMetadata: DefaultMetadata
  onChangeDefaultMetadata?(defaultMetadata: DefaultMetadata): void
}

export function ContentMetadataPanel({
  defaultMetadata,
  onChangeDefaultMetadata
}: ContentMetadataPanelProps) {
  const {title, shared} = defaultMetadata
  const {t} = useTranslation()

  return (
    <Panel>
      <Form fluid>
        <FormGroup>
          <ControlLabel>{t('content.overview.internalTitle')}</ControlLabel>
          <FormControl
            value={title}
            placeholder={t('content.overview.internalTitlePlaceholder')}
            onChange={title => onChangeDefaultMetadata?.({...defaultMetadata, title})}
          />
        </FormGroup>
      </Form>
      <Form fluid layout="horizontal" style={{marginTop: '20px'}}>
        <FormGroup>
          <span style={{marginRight: 10}}>{t('articleEditor.panels.allowPeerPublishing')}</span>
          <Toggle
            checkedChildren={t('global.buttons.yes')}
            unCheckedChildren={t('global.buttons.no')}
            checked={shared}
            onChange={shared => onChangeDefaultMetadata?.({...defaultMetadata, shared})}
          />
        </FormGroup>
      </Form>
    </Panel>
  )
}
