/* eslint-disable i18next/no-literal-string */
import React from 'react'
import {useTranslation} from 'react-i18next'
import {Button, Drawer, Modal} from 'rsuite'
import {RefSelectPanel, RefSelectPanelProps} from './refSelectPanel'

export function RefSelectModal(props: RefSelectPanelProps) {
  const {t} = useTranslation()
  return (
    <>
      <Drawer.Header onHide={() => props.onClose?.()}>
        <Drawer.Title>Choose a reference</Drawer.Title>
      </Drawer.Header>

      <Drawer.Body>
        <RefSelectPanel {...props}></RefSelectPanel>
      </Drawer.Body>

      <Drawer.Footer>
        <Button appearance={'subtle'} onClick={() => props.onClose?.()}>
          {t('articleEditor.panels.close')}
        </Button>
      </Drawer.Footer>
    </>
  )
}
