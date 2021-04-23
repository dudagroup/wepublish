import React from 'react'
import {ControlLabel, Form, FormControl, FormGroup, Toggle, HelpBlock, Panel} from 'rsuite'
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
      <Form fluid={true}>
        <FormGroup>
          <ControlLabel>{t('articleEditor.panels.title')}</ControlLabel>
          <FormControl
            value={title}
            onChange={title => onChangeDefaultMetadata?.({...defaultMetadata, title})}
          />
        </FormGroup>
      </Form>
      <Form fluid={true} style={{marginTop: '20px'}}>
        <FormGroup>
          <ControlLabel>{t('articleEditor.panels.peering')}</ControlLabel>
          <Toggle
            checked={shared}
            onChange={shared => onChangeDefaultMetadata?.({...defaultMetadata, shared})}
          />
          <HelpBlock>{t('articleEditor.panels.allowPeerPublishing')}</HelpBlock>
        </FormGroup>
      </Form>
      <hr></hr>
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
