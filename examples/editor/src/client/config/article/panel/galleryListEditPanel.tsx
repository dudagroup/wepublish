import React, {useState} from 'react'
import nanoid from 'nanoid'
import {Button, Drawer, Form, FormGroup, ControlLabel, FormControl, Modal} from 'rsuite'
import {ListInput, ListValue, FieldProps} from '../atoms/listInput'
import {GalleryImageEdge} from '../blocks/types'
import {useTranslation} from 'react-i18next'
import {ChooseEditImage} from '../atoms/chooseEditImage'
import {Configs, ContentEditor, RefSelectModal, useRecordHook} from '@wepublish/editor'
import {ImageRecord} from '../interfaces/interfaces'

export interface GalleryListEditPanelProps {
  readonly id?: string
  readonly initialImages: GalleryImageEdge[]
  readonly configs: Configs
  onSave?(images: GalleryImageEdge[]): void
  onClose?(): void
}

export function GalleryListEditPanel({
  initialImages,
  onSave,
  onClose,
  configs
}: GalleryListEditPanelProps) {
  const [images, setImages] = useState<ListValue<GalleryImageEdge>[]>(() =>
    initialImages.map(value => ({
      id: nanoid(),
      value
    }))
  )

  const {t} = useTranslation()

  return (
    <>
      <Drawer.Header>
        <Drawer.Title>{t('blocks.imageGallery.panels.editGallery')}</Drawer.Title>
      </Drawer.Header>

      <Drawer.Body>
        <ListInput
          value={images}
          onChange={images => setImages(images)}
          defaultValue={{image: null, caption: ''}}>
          {props => <GalleryListItem {...props} configs={configs} />}
        </ListInput>
      </Drawer.Body>

      <Drawer.Footer>
        <Button appearance={'primary'} onClick={() => onSave?.(images.map(({value}) => value))}>
          {t('blocks.imageGallery.panels.save')}
        </Button>
        <Button appearance={'subtle'} onClick={() => onClose?.()}>
          {t('blocks.imageGallery.panels.close')}
        </Button>
      </Drawer.Footer>
    </>
  )
}

export function GalleryListItem({
  value,
  onChange,
  configs
}: FieldProps<GalleryImageEdge> & {configs: Configs}) {
  const [isChooseModalOpen, setChooseModalOpen] = useState(false)
  const [isEditModalOpen, setEditModalOpen] = useState(false)

  const {image: imageRef, caption} = value
  const {t} = useTranslation()
  const imageRecord = useRecordHook<ImageRecord>(imageRef)

  return (
    <>
      <div>
        <ChooseEditImage
          header={''}
          image={imageRecord}
          disabled={false}
          left={5}
          top={0}
          openChooseModalOpen={() => setChooseModalOpen(true)}
          openEditModalOpen={() => setEditModalOpen(true)}
          removeImage={() => onChange?.({...value, image: null})}
        />
        <Form fluid={true}>
          <FormGroup>
            <ControlLabel>{t('blocks.imageGallery.panels.caption')}</ControlLabel>
            <FormControl
              rows={1}
              componentClass="textarea"
              value={caption}
              onChange={caption => onChange({...value, caption})}
            />
          </FormGroup>
        </Form>
      </div>

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
            onChange(value => ({...value, image: ref}))
          }}
        />
      </Modal>
      {imageRef && (
        <Modal
          show={isEditModalOpen}
          size="lg"
          backdrop="static"
          full
          onHide={() => setEditModalOpen(false)}>
          <Modal.Body>
            <ContentEditor
              onBack={() => setEditModalOpen(false)}
              id={imageRef.recordId}
              type={'mediaLibrary'}
              configs={configs}></ContentEditor>
          </Modal.Body>
        </Modal>
      )}
    </>
  )
}
