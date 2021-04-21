import React, {useRef, useEffect, useState} from 'react'

import {Drawer, IconButton, Icon, Input} from 'rsuite'
import {BlockProps} from '../atoms/blockList'
import {LinkPageBreakBlockValue} from './types'

import {useTranslation} from 'react-i18next'
import {LinkPageBreakEditPanel} from '../panel/linkPageBreakEditPanel'
import {ChooseEditImage} from '../atoms/chooseEditImage'
import {createDefaultValue, ImagedEditPanel, RichTextBlock} from '@wepublish/editor'
import {ImageRefFragment, useImageQuery} from '../api'
import {isFunctionalUpdate} from '@karma.run/react'
export type LinkPageBreakBlockProps = BlockProps<LinkPageBreakBlockValue>

export function LinkPageBreakBlock({
  value,
  autofocus,
  onChange,
  disabled
}: LinkPageBreakBlockProps) {
  const {text, richText, image} = value
  const focusRef = useRef<HTMLTextAreaElement>(null)
  const focusInputRef = useRef<HTMLInputElement>(null)

  const {t} = useTranslation()

  useEffect(() => {
    if (autofocus) focusRef.current?.focus()
  }, [])

  // function handleImageChange(image: Reference | undefined) {
  //   // onChange({...value, image})
  // }

  const [isChooseModalOpen, setChooseModalOpen] = useState(false)
  const [isEditModalOpen, setEditModalOpen] = useState(false)
  const [isEditPanelOpen, setEditPanelOpen] = useState(false)
  const {data} = useImageQuery({
    skip: image?.record || !image?.recordId,
    variables: {
      id: image?.recordId || ''
    }
  })
  const imageRecord: ImageRefFragment = image?.record || data?.image

  return (
    <>
      <div style={{position: 'relative', width: '100%'}}>
        <div style={{position: 'absolute', zIndex: 1, height: '100%', right: 0}}>
          <IconButton
            size={'lg'}
            icon={<Icon icon="pencil" />}
            onClick={() => setEditPanelOpen(true)}
          />
        </div>
      </div>
      <div style={{display: 'flex', flexFlow: 'row wrap', marginTop: 50}}>
        <div style={{flex: '1 0 25%', alignSelf: 'center', marginBottom: '10px'}}>
          <ChooseEditImage
            header={''}
            image={imageRecord}
            disabled={false}
            openChooseModalOpen={() => setChooseModalOpen(true)}
            openEditModalOpen={() => setEditModalOpen(true)}
            removeImage={() => {
              onChange(undefined, ['image'])
            }}
          />
        </div>
        <div style={{flex: '1 0 70%'}}>
          <Input
            ref={focusInputRef}
            placeholder={t('blocks.linkPageBreak.title')}
            style={{fontSize: '24px', marginBottom: 20}}
            value={text}
            disabled={disabled}
            onChange={text => {
              onChange(text, ['text'])
            }}
          />

          <RichTextBlock
            value={richText || createDefaultValue()}
            onChange={richText => {
              const v = isFunctionalUpdate(richText) ? richText(value.richText) : richText
              onChange(v, ['richText'])
            }}
          />
        </div>
      </div>
      <Drawer show={isChooseModalOpen} size={'sm'} onHide={() => setChooseModalOpen(false)}>
        {/* <ImageSelectPanel
          onClose={() => setChooseModalOpen(false)}
          onSelect={value => {
            //
          }}
          onSelectRef={value => {
            setChooseModalOpen(false)
            handleImageChange(value)
          }}
        /> */}
      </Drawer>
      {image && (
        <Drawer show={isEditModalOpen} size={'sm'} onHide={() => setEditModalOpen(false)}>
          <ImagedEditPanel
            id={image!.recordId}
            onClose={() => setEditModalOpen(false)}
            onSave={() => setEditModalOpen(false)}
          />
        </Drawer>
      )}
      <Drawer show={isEditPanelOpen} size={'sm'} onHide={() => setEditPanelOpen(false)}>
        <LinkPageBreakEditPanel
          value={value}
          onClose={() => setEditPanelOpen(false)}
          onChange={onChange => {
            //
          }}
        />
      </Drawer>
    </>
  )
}
