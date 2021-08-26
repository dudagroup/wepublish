import React from 'react'
import {useTranslation} from 'react-i18next'
import {Button, Drawer} from 'rsuite'
import {RefSelectPanel, RefSelectPanelProps} from './refSelectPanel'

export function RefSelectDrawer(props: RefSelectPanelProps) {
  const {t} = useTranslation()
  return (
    <>
      <Drawer.Header onHide={() => props.onClose?.()}>
        <Drawer.Title>{t('content.panels.chooseReference')}</Drawer.Title>
      </Drawer.Header>

      <Drawer.Body>
        <RefSelectPanel {...props}></RefSelectPanel>
      </Drawer.Body>

      <Drawer.Footer>
        <Button style={{marginBottom: 10}} onClick={() => props.onClose?.()}>
          {t('global.buttons.close')}
        </Button>
      </Drawer.Footer>
    </>
  )
}
