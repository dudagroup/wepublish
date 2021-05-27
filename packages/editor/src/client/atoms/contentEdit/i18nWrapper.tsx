import React, {memo, ReactElement} from 'react'
import {FormGroup, Row, Col} from 'rsuite'

export interface I18nProps {
  readonly lane1: ReactElement | null
  readonly lane2: ReactElement | null
}

export const I18nWrapper = memo(function I18nWrapper({lane1, lane2}: I18nProps) {
  return (
    <Row className="show-grid" style={{marginBottom: 24}}>
      <Col xs={14}>
        <FormGroup>{lane1}</FormGroup>
      </Col>
      <Col xs={1} style={{textAlign: 'center', paddingTop: '5px'}}></Col>
      <Col xs={9}>
        <FormGroup>{lane2}</FormGroup>
      </Col>
    </Row>
  )
})
