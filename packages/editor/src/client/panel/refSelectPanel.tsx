import React, {useState} from 'react'
import {Icon, Nav} from 'rsuite'
import {ContentModelSchemaFieldRefTypeMap, ReferenceScope} from '../interfaces/contentModelSchema'
import {Reference} from '../interfaces/referenceType'
import {RefContentSelectPanel} from './refContentSelectPanel'

export interface RefSelectPanelProps {
  readonly config: ContentModelSchemaFieldRefTypeMap
  onClose(): void
  onSelectRef: (ref: Reference) => void
}

export function RefSelectPanel({onSelectRef, config}: RefSelectPanelProps) {
  const types = Object.entries(config).map(([type, {scope}]) => {
    return {
      type,
      scope
    }
  })
  const [tabIndex, setTabIndex] = useState(0)
  const currentType = types[tabIndex]

  const tabs = types.map((type, index) => {
    return (
      <Nav.Item key={index} eventKey={index} icon={<Icon icon="file-text" />}>
        {type.type}
      </Nav.Item>
    )
  })

  function currentContent(currentType: {type: string; scope: ReferenceScope}) {
    return (
      <RefContentSelectPanel
        onSelectRef={onSelectRef}
        scope={currentType.scope}
        type={currentType.type}></RefContentSelectPanel>
    )
  }

  return (
    <>
      <Nav
        appearance="tabs"
        activeKey={tabIndex}
        onSelect={tabIndex => setTabIndex(tabIndex)}
        style={{marginBottom: 20}}>
        {tabs}
      </Nav>
      {currentContent(currentType)}
    </>
  )
}
