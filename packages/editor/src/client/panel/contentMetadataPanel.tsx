/* eslint-disable i18next/no-literal-string */
import React from 'react'
import {
  ControlLabel,
  Form,
  FormGroup,
  Toggle,
  Panel,
  InputGroup,
  Whisper,
  IconButton,
  Icon,
  Tooltip,
  Input
} from 'rsuite'
import {useTranslation} from 'react-i18next'
import {MapType} from '../interfaces/utilTypes'
import {I18nWrapper} from '../atoms/contentEdit/i18nWrapper'
import {slugify} from '../utility'
import jsonpath from 'jsonpath'
import {ContentModelConfigMerged} from '../interfaces/extensionConfig'

export interface DefaultMetadata {
  readonly title: string
  readonly shared: boolean
  readonly slugI18n: MapType<string>
}

export interface ContentMetadataPanelProps {
  readonly defaultMetadata: DefaultMetadata
  readonly langLanes: string[]
  readonly content: MapType<unknown>
  readonly meta?: MapType<unknown>
  readonly config: ContentModelConfigMerged
  onChangeDefaultMetadata?(defaultMetadata: DefaultMetadata): void
}

export function ContentMetadataPanel({
  defaultMetadata,
  onChangeDefaultMetadata,
  langLanes,
  content,
  config,
  meta
}: ContentMetadataPanelProps) {
  const {title, slugI18n, shared} = defaultMetadata
  const {t} = useTranslation()

  const [componentLane1, componentLane2] = langLanes.map((lang, index) => {
    const slug = slugI18n?.[lang] || ''

    let deriveButton = null
    if (config.deriveSlug) {
      deriveButton = (
        <Whisper
          placement="top"
          trigger="hover"
          speaker={<Tooltip>{config.deriveSlug.instructions}</Tooltip>}>
          <IconButton
            icon={<Icon icon="magic" />}
            onClick={() => {
              if (config.deriveSlug) {
                const result = jsonpath.query({content, meta}, config.deriveSlug.jsonPath)
                if (result.length > 0 && config.deriveSlug) {
                  let val = result[0]
                  if (typeof val !== 'string') {
                    val = val?.[lang]
                  }
                  if (typeof val === 'string') {
                    onChangeDefaultMetadata?.({
                      ...defaultMetadata,
                      slugI18n: {...slugI18n, [lang]: slugify(val, true)}
                    })
                  }
                }
              }
            }}
          />
        </Whisper>
      )
    }

    return (
      <InputGroup key={lang} style={{width: '100%'}}>
        <Input
          value={slug}
          disabled={index > 0}
          onChange={val =>
            onChangeDefaultMetadata?.({...defaultMetadata, slugI18n: {...slugI18n, [lang]: val}})
          }
          onBlur={() =>
            onChangeDefaultMetadata?.({
              ...defaultMetadata,
              slugI18n: {...slugI18n, [lang]: slugify(slug, true)}
            })
          }
        />
        {deriveButton}
      </InputGroup>
    )
  })

  return (
    <Panel collapsible defaultExpanded header="Internal title, URL & Peering">
      <Form fluid>
        <FormGroup>
          <ControlLabel>{t('content.overview.internalTitle')}</ControlLabel>
          <Input
            style={{width: '58.33333333%'}}
            value={title}
            placeholder={t('content.overview.internalTitlePlaceholder')}
            onChange={title => onChangeDefaultMetadata?.({...defaultMetadata, title})}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{t('articleEditor.panels.slug')}</ControlLabel>
          <I18nWrapper lane1={componentLane1} lane2={componentLane2} />
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
