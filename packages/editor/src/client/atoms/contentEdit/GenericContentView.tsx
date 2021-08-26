import {ContentModelSchemas} from '@dudagroup/api'
import {MapType} from '@dudagroup/api/lib/interfaces/utilTypes'
import React, {memo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Grid, Panel} from 'rsuite'
import {LanguagesConfig} from '../../api'
import {ContentEditAction} from '../../control/contentReducer'
import {ContentModelSchemaTypes} from '../../interfaces/contentModelSchema'
import {Configs} from '../../interfaces/extensionConfig'
import BlockObject from './BlockObject'
import LanguageControl from './LanguageControl'

interface GenericContentViewProps {
  readonly fields: MapType<ContentModelSchemas>
  readonly record: MapType<unknown>
  readonly dispatch: React.Dispatch<ContentEditAction>
  readonly languagesConfig: LanguagesConfig
  readonly configs: Configs
  readonly langLaneL?: string
  readonly langLaneR?: string
  readonly langUi: string
  readonly presentLanguageControl?: boolean
}

export function GenericContent({
  fields,
  languagesConfig,
  record,
  dispatch,
  configs,
  langLaneL,
  langLaneR,
  langUi,
  presentLanguageControl
}: GenericContentViewProps) {
  const [langLane1, setLangLane1] = useState(languagesConfig.languages?.[0]?.tag)
  const [langLane2, setLangLane2] = useState(languagesConfig.languages?.[1]?.tag)
  const {t} = useTranslation()

  let header = null
  if (presentLanguageControl && languagesConfig.languages.length >= 2) {
    header = (
      <LanguageControl
        languagesConfig={languagesConfig}
        langLaneL={langLane1}
        langLaneR={langLane2}
        setLangLaneL={setLangLane1}
        setLangLaneR={setLangLane2}
      />
    )
  }
  return (
    <Grid>
      {header}
      <Panel bordered collapsible defaultExpanded header={t('content.panels.contentSectionTitle')}>
        <BlockObject
          configs={configs}
          dispatch={dispatch}
          model={{
            type: ContentModelSchemaTypes.object,
            fields
          }}
          languageContext={{
            langLane1: presentLanguageControl && langLane1 ? langLane1 : langLaneL || langLane1,
            langLane2: presentLanguageControl && langLane2 ? langLane2 : langLaneR || langLane2,
            languagesConfig,
            langUi
          }}
          value={record}
          schemaPath={[]}></BlockObject>
      </Panel>
    </Grid>
  )
}

export const GenericContentView = memo(GenericContent, (a, b) => {
  return Object.is(a.record, b.record) && a.langLaneL === b.langLaneL && a.langLaneR === b.langLaneR
})
