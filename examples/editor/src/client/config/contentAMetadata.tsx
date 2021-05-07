import React from 'react'
import {ControlLabel, Form, FormControl, FormGroup, Toggle, HelpBlock, Panel} from 'rsuite'
import {useTranslation} from 'react-i18next'
import {ContentAEditView, ContentAEditViewValue} from './contentA'
import {ContentEditAction} from '@wepublish/editor/lib/client/control/contentReducer'
import {Configs} from '@wepublish/editor'

export interface DefaultMetadata {
  readonly title: string
  readonly shared: boolean
}

export interface ContentMetadataPanelProps {
  readonly defaultMetadata: DefaultMetadata
  readonly customMetadata: ContentAEditViewValue
  onChangeDefaultMetadata?(defaultMetadata: DefaultMetadata): void
  readonly dispatch: React.Dispatch<ContentEditAction>
  readonly configs: Configs
  readonly langLaneL: string
  readonly langLaneR: string
}

export function ContentMetadataPanel({
  defaultMetadata,
  customMetadata,
  onChangeDefaultMetadata,
  dispatch,
  configs,
  langLaneL,
  langLaneR
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
      <ContentAEditView
        value={customMetadata}
        configs={configs}
        dispatch={dispatch}
        langLaneL={langLaneL}
        langLaneR={langLaneR}
      />
    </Panel>
  )
}
