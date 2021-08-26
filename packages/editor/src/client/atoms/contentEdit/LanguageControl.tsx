import React, {useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {Button, Col, Icon, Row, SelectPicker} from 'rsuite'
import {LanguagesConfig} from '../../api'

interface LanguageControlProps {
  readonly languagesConfig: LanguagesConfig
  readonly langLaneL: string
  readonly langLaneR: string
  readonly setLangLaneL: (lang: string) => void
  readonly setLangLaneR: (lang: string) => void
}

export default function LanguageControl({
  languagesConfig,
  langLaneL,
  langLaneR,
  setLangLaneL,
  setLangLaneR
}: LanguageControlProps) {
  const {t} = useTranslation()
  const languages = languagesConfig.languages.map(v => {
    const isDefaultLangFlag =
      languagesConfig.defaultLanguageTag === v.tag ? ` (${t('content.panels.default')})` : ''
    return {
      label: v.tag + isDefaultLangFlag,
      value: v.tag
    }
  })

  const header = useMemo(() => {
    if (languagesConfig.languages.length >= 2) {
      return (
        <Row className="show-grid">
          <Col xs={14}>
            <SelectPicker
              cleanable={false}
              data={languages}
              value={langLaneL}
              appearance="subtle"
              onChange={setLangLaneL}
            />
          </Col>
          <Col xs={1} style={{textAlign: 'center'}}>
            <Button
              style={{paddingTop: 12}}
              appearance="link"
              onClick={() => {
                if (langLaneL && langLaneR) {
                  setLangLaneL(langLaneR)
                  setLangLaneR(langLaneL)
                }
              }}>
              {<Icon icon="exchange" />}
            </Button>
          </Col>
          <Col xs={9} style={{textAlign: 'right'}}>
            <SelectPicker
              cleanable={false}
              data={languages}
              value={langLaneR}
              appearance="subtle"
              onChange={setLangLaneR}
            />
          </Col>
        </Row>
      )
    }
    return null
  }, [langLaneL, langLaneR])

  return header
}
