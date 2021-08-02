import React, {useState} from 'react'
import {Icon, Nav} from 'rsuite'
import {ContentModelSchemaFieldRefTypeMap, ReferenceScope} from '../interfaces/contentModelSchema'
import {Configs} from '../interfaces/extensionConfig'
import {Reference} from '../interfaces/referenceType'
import {ContentList} from '../routes/contentList'

export interface RefSelectPanelProps {
  readonly refConfig: ContentModelSchemaFieldRefTypeMap
  readonly configs: Configs
  onClose(): void
  onSelectRef: (ref: Reference) => void
}

export function RefSelectPanel({onSelectRef, configs, refConfig}: RefSelectPanelProps) {
  const types = Object.entries(refConfig).map(([type, {scope}]) => {
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
    const config = configs.contentModelExtensionMerged.find(config => {
      return config.identifier === currentType.type
    })
    if (config) {
      return (
        <ContentList
          configs={configs}
          currentContentConfig={config}
          type={currentType.type}
          scope={currentType.scope}
          onSelectRef={onSelectRef}></ContentList>
      )
    }
    return <h1>Content Type {currentType.type} not supported</h1>
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
