import React, {useState, useEffect} from 'react'

import {Drawer, Dropdown, Icon, IconButton, Modal, Panel} from 'rsuite'

import {PlaceholderInput} from '../atoms/placeholderInput'
import {TypographicTextArea} from '../atoms/typographicTextArea'
import {BlockProps} from '../atoms/blockList'

import {ImageGalleryBlockValue} from './types'
import {GalleryListEditPanel} from '../panel/galleryListEditPanel'

import {useTranslation} from 'react-i18next'
import {ContentEditor, RefSelectModal, useRecordHook} from '@wepublish/editor'

export function ImageGalleryBlock({
  value,
  onChange,
  autofocus,
  disabled,
  configs
}: BlockProps<ImageGalleryBlockValue>) {
  const [isGalleryListEditModalOpen, setGalleryListEditModalOpen] = useState(false)

  const [isChooseModalOpen, setChooseModalOpen] = useState(false)
  const [isEditModalOpen, setEditModalOpen] = useState(false)

  const [index, setIndex] = useState(0)

  const item = value.images[index]

  const image = item?.image
  const record = useRecordHook(image)

  const caption = item?.caption ?? ''

  const hasPrevious = index > 0
  const hasNext = index < value.images.length - 1

  const isNewIndex = !image && !caption && index >= value.images.length

  const {t} = useTranslation()

  useEffect(() => {
    if (autofocus) {
      setGalleryListEditModalOpen(true)
    }
  }, [])

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 10
        }}>
        <div
          style={{
            flexBasis: 0,
            flexGrow: 1,
            flexShrink: 1
          }}>
          <IconButton
            icon={<Icon icon="list" />}
            onClick={() => setGalleryListEditModalOpen(true)}
            disabled={disabled}
          />
        </div>
        <div
          style={{
            display: 'flex',
            flexBasis: 0,
            justifyContent: 'center',
            flexGrow: 1,
            flexShrink: 1
          }}>
          <p style={{color: 'gray'}} color="gray">
            {index + 1} / {Math.max(index + 1, value.images.length)} {isNewIndex ? '(New)' : ''}
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            flexBasis: 0,
            justifyContent: 'flex-end',
            flexGrow: 1,
            flexShrink: 1
          }}>
          <IconButton
            icon={<Icon icon="arrow-circle-left" />}
            onClick={() => setIndex(index => index - 1)}
            disabled={disabled || !hasPrevious}
            style={{
              marginRight: 5
            }}
          />
          <IconButton
            icon={<Icon icon="arrow-circle-right" />}
            onClick={() => setIndex(index => index + 1)}
            disabled={disabled || !hasNext}
            style={{
              marginRight: 10
            }}
          />
          <IconButton
            icon={<Icon icon="plus-circle" />}
            onClick={() => setIndex(value.images.length)}
            disabled={disabled || isNewIndex}
          />
        </div>
      </div>
      <Panel
        bordered={true}
        bodyFill={true}
        style={{
          height: 300,
          overflow: 'hidden',
          marginBottom: 10
        }}>
        <PlaceholderInput onAddClick={() => setChooseModalOpen(true)}>
          {record?.content.media?.media?.image && (
            <div
              style={{
                padding: 0,
                position: 'relative',
                height: '100%',
                backgroundSize: `${record.content.media.media.height > 300 ? 'contain' : 'auto'}`,
                backgroundPositionX: 'center',
                backgroundPositionY: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundImage: `url(${
                  record.content.media.media.url ?? 'https://via.placeholder.com/240x240'
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
                {/* TODO: Meta sync */}
              </Dropdown>
            </div>
          )}
        </PlaceholderInput>
      </Panel>
      <TypographicTextArea
        variant="subtitle2"
        align="center"
        placeholder={t('blocks.imageGallery.overview.caption')}
        value={caption}
        disabled={disabled}
        onChange={e => {
          onChange(
            Object.assign([], value.images, {
              [index]: {
                image,
                caption: e.target.value
              }
            }),
            ['images']
          )
        }}
      />
      <Modal show={isChooseModalOpen} size="lg" full onHide={() => setChooseModalOpen(false)}>
        <RefSelectModal
          refConfig={{
            mediaLibrary: {
              scope: 'local'
            }
          }}
          configs={configs}
          onClose={() => setChooseModalOpen(false)}
          onSelectRef={ref => {
            setChooseModalOpen(false)
            onChange(
              Object.assign([], value.images, {
                [index]: {
                  image: ref,
                  caption
                }
              }),
              ['images']
            )
          }}
        />
      </Modal>
      {image && (
        <Modal
          show={isEditModalOpen}
          size="lg"
          backdrop="static"
          full
          onHide={() => setEditModalOpen(false)}>
          <Modal.Body>
            <ContentEditor
              onBack={() => setEditModalOpen(false)}
              id={image!.recordId}
              type={'mediaLibrary'}
              configs={configs}></ContentEditor>
          </Modal.Body>
        </Modal>
      )}
      <Drawer
        show={isGalleryListEditModalOpen}
        size={'sm'}
        onHide={() => setGalleryListEditModalOpen(false)}>
        <GalleryListEditPanel
          configs={configs}
          initialImages={value.images}
          onSave={images => {
            onChange(Object.assign([], images), ['images'])
            setGalleryListEditModalOpen(false)
          }}
          onClose={() => setGalleryListEditModalOpen(false)}
        />
      </Drawer>
    </>
  )
}
