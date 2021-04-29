import React, {memo, ReactElement} from 'react'
import {FormGroup, Row, Col} from 'rsuite'

export interface ArticleMetadataProperty {
  readonly key: string
  readonly value: string
  readonly public: boolean
}

export interface ArticleMetadata {
  readonly evaluationBodyId: string
  readonly evaluationBodyNumber: string
  readonly evaluationBodyName: string
  readonly personName: string
  readonly academicDegree: string
  readonly personNumber: string
  readonly isResearchCouncilMember: string
  readonly university: string
  readonly website: string
  readonly _function: string
  readonly membershipValidFrom: string
  readonly membershipValidUntil: string
  readonly evaluationBodyType: string
  readonly evaluationBodyPublishedFromDate: string
  readonly evaluationBodyPublishedUntilDate: string
  readonly evaluationBodySortNumber: string
  readonly functionSortNumber: string
}

export interface I18nProps {
  readonly lane1: ReactElement | null
  readonly lane2: ReactElement | null
}

export const I18nWrapper = memo(function I18nWrapper({lane1, lane2}: I18nProps) {
  return (
    <Row className="show-grid" style={{display: 'flex', alignItems: 'center', marginBottom: 24}}>
      <Col xs={11}>
        <FormGroup>{lane1}</FormGroup>
      </Col>
      <Col xs={2} style={{textAlign: 'center', paddingTop: '5px'}}></Col>
      <Col xs={11}>
        <FormGroup>{lane2}</FormGroup>
      </Col>
    </Row>
  )
})
