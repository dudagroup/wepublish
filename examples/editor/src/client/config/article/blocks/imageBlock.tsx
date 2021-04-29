import React, {useState, useEffect} from 'react'

import {Drawer, Dropdown, Icon, IconButton, Modal, Panel} from 'rsuite'
import {BlockProps} from '../atoms/blockList'
import {PlaceholderInput} from '../atoms/placeholderInput'
import {TypographicTextArea} from '../atoms/typographicTextArea'
import {ImageBlockValue} from './types'
import {useTranslation} from 'react-i18next'
import {ContentEditor, RefSelectDrawer, useRecordHook} from '@wepublish/editor'
import {ImageRecord} from '../interfaces/interfaces'
import {MODEL_MEDIA_LIBRARY} from '../../config'

// TODO: Handle disabled prop
export function ImageBlock({value, onChange, configs, autofocus}: BlockProps<ImageBlockValue>) {
  const {image, caption} = value
  const [isChooseModalOpen, setChooseModalOpen] = useState(false)
  const [isEditModalOpen, setEditModalOpen] = useState(false)
  const imageRecord = useRecordHook<ImageRecord>(image || undefined)

  const {t} = useTranslation()

  useEffect(() => {
    if (autofocus && !value.image) {
      setChooseModalOpen(true)
    }
  }, [autofocus, value.image])

  let imageComponent = null
  if (imageRecord?.content?.media?.media.image) {
    imageComponent = (
      <Panel
        style={{
          padding: 0,
          position: 'relative',
          height: '100%',
          backgroundSize: `${
            imageRecord.content.media.media.image.height > 300 ? 'contain' : 'auto'
          }`,
          backgroundPositionX: 'center',
          backgroundPositionY: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundImage: `url(${
            imageRecord.content.media.media.url ?? 'https://via.placeholder.com/240x240'
          })`
        }}>
        <Dropdown
          renderTitle={() => {
            return <IconButton appearance="subtle" icon={<Icon icon="wrench" />} circle />
          }}>
          <Dropdown.Item onClick={() => setChooseModalOpen(true)}>
            <Icon icon="image" /> {t('blocks.image.overview.chooseImage')}
          </Dropdown.Item>
          <Dropdown.Item onClick={() => setEditModalOpen(true)}>
            <Icon icon="pencil" /> {t('blocks.image.overview.editImage')}
          </Dropdown.Item>
          {/* TODO: Meta sync for metadata image */}
        </Dropdown>
      </Panel>
    )
  }
  return (
    <>
      <Panel
        bodyFill={true}
        bordered={true}
        style={{
          height: 300,
          overflow: 'hidden',
          marginBottom: 10
        }}>
        <PlaceholderInput onAddClick={() => setChooseModalOpen(true)}>
          {imageComponent}
        </PlaceholderInput>
      </Panel>
      <TypographicTextArea
        variant="subtitle2"
        align="center"
        placeholder={t('blocks.image.overview.caption')}
        value={caption}
        onChange={e => {
          onChange(e.target.value, ['caption'])
        }}
      />
      <Drawer show={isChooseModalOpen} size="lg" full onHide={() => setChooseModalOpen(false)}>
        <RefSelectDrawer
          refConfig={{
            [MODEL_MEDIA_LIBRARY]: {
              scope: 'local'
            }
          }}
          configs={configs}
          onClose={() => setChooseModalOpen(false)}
          onSelectRef={ref => {
            setChooseModalOpen(false)
            onChange(ref, ['image'])
          }}
        />
      </Drawer>
      {image && (
        <Modal
          show={isEditModalOpen}
          placement={'bottom'}
          backdrop="static"
          full
          onHide={() => setEditModalOpen(false)}>
          <Modal.Body>
            <ContentEditor
              onBack={() => setEditModalOpen(false)}
              id={image.recordId}
              type={MODEL_MEDIA_LIBRARY}
              configs={configs}></ContentEditor>
          </Modal.Body>
        </Modal>
      )}
    </>
  )
}
