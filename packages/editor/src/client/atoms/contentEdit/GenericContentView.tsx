import {ContentModelSchemas} from '@wepublish/api'
import {MapType} from '@wepublish/api/lib/interfaces/utilTypes'
import React, {memo, useMemo, useState} from 'react'
import {Button, Col, Form, Grid, Icon, Panel, Row, SelectPicker} from 'rsuite'
import {LanguagesConfig} from '../../api'
import {ContentEditAction} from '../../control/contentReducer'
import {ContentModelSchemaTypes} from '../../interfaces/apiTypes'
import BlockObject from './BlockObject'

interface GenericContentViewProps {
  readonly fields: MapType<ContentModelSchemas>
  readonly record: MapType<unknown>
  readonly dispatch: React.Dispatch<ContentEditAction>
  readonly languagesConfig: LanguagesConfig
}

export function GenericContent({
  fields,
  languagesConfig,
  record,
  dispatch
}: GenericContentViewProps) {
  const [langLane1, setLangLane1] = useState(languagesConfig.languages?.[0]?.tag)
  const [langLane2, setLangLane2] = useState(languagesConfig.languages?.[1]?.tag)

  const languages = languagesConfig.languages.map(v => {
    return {
      label: v.tag,
      value: v.tag
    }
  })

  let header
  if (languagesConfig.languages.length >= 2) {
    header = useMemo(() => {
      return (
        <Row className="show-grid">
          <Col xs={11}>
            <SelectPicker
              cleanable={false}
              data={languages}
              value={langLane1}
              appearance="subtle"
              onChange={setLangLane1}
              style={{width: 100}}
            />
          </Col>
          <Col xs={2} style={{textAlign: 'center'}}>
            <Button
              appearance="link"
              onClick={() => {
                setLangLane1(langLane2)
                setLangLane2(langLane1)
              }}>
              {<Icon icon="exchange" />}
            </Button>
          </Col>
          <Col xs={11} style={{textAlign: 'right'}}>
            <SelectPicker
              cleanable={false}
              data={languages}
              value={langLane2}
              appearance="subtle"
              onChange={setLangLane2}
              style={{width: 100}}
            />
          </Col>
        </Row>
      )
    }, [langLane2, langLane1])
  }

  return (
    <Grid>
      {header}
      <Panel bordered>
        <Form fluid={true} style={{width: '100%'}}>
          <BlockObject
            dispatch={dispatch}
            model={{
              type: ContentModelSchemaTypes.object,
              fields
            }}
            languageContext={{
              langLane1,
              langLane2,
              languagesConfig
            }}
            value={record}
            schemaPath={[]}></BlockObject>
        </Form>
      </Panel>
    </Grid>
  )
}

export const GenericContentView = memo(GenericContent, (a, b) => {
  return Object.is(a.record, b.record)
})
