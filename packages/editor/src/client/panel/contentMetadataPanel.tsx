/* eslint-disable i18next/no-literal-string */
import React from 'react'
import {ControlLabel, Form, FormControl, FormGroup, Toggle, Panel} from 'rsuite'
import {useTranslation} from 'react-i18next'
import {GenericContentView} from '../atoms/contentEdit/GenericContentView'
import {LanguagesConfig} from '../api'
import {ContentModelSchemas} from '../interfaces/contentModelSchema'
import {MapType} from '../interfaces/utilTypes'
import {Configs} from '../interfaces/extensionConfig'

export interface DefaultMetadata {
  readonly title: string
  readonly shared: boolean
}

export interface ContentMetadataPanelProps {
  readonly defaultMetadata: DefaultMetadata
  readonly customMetadata: any
  onChangeDefaultMetadata?(defaultMetadata: DefaultMetadata): void
  readonly customMetadataDispatcher: React.Dispatch<any>
  readonly languagesConfig: LanguagesConfig
  readonly customMetaFields: MapType<ContentModelSchemas>
  readonly configs: Configs
}

export function ContentMetadataPanel({
  defaultMetadata,
  customMetadata,
  onChangeDefaultMetadata,
  customMetadataDispatcher,
  languagesConfig,
  customMetaFields,
  configs
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
      {customMetaFields && customMetadata && (
        <GenericContentView
          configs={configs}
          record={customMetadata}
          fields={customMetaFields}
          languagesConfig={languagesConfig}
          dispatch={customMetadataDispatcher}></GenericContentView>
      )}
    </Panel>
  )
}
