import React, {memo, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {Button, Icon, Panel} from 'rsuite'
import {ContentModelSchemaFieldRef} from '../../interfaces/contentModelSchema'
import {DescriptionList, DescriptionListItem} from '../descriptionList'
import {FileDropInput} from '../fileDropInput'
import {FocalPointInput} from '../focalPointInput'
import {BlockAbstractProps} from './BlockAbstract'
import prettyBytes from 'pretty-bytes'
import {ContentEditActionEnum} from '../../control/contentReducer'
import {MediaDetail, MediaInput, MediaOutput} from '../../interfaces/mediaType'

function BlockMedia({
  value,
  schemaPath,
  dispatch
}: BlockAbstractProps<ContentModelSchemaFieldRef, (MediaOutput & MediaInput) | null>) {
  const {t} = useTranslation()

  useEffect(() => {
    if (value?.file) {
      const reader = new FileReader()
      const [filename, ...extensions] = value.file.name.split('.')
      const extension = `.${extensions.join('.')}`
      const image = new Image()

      const handleReaderLoad = function () {
        image.src = reader.result as string
      }

      const handleImageLoad = function () {
        const mediaDetail: Partial<MediaDetail> = {
          createdAt: undefined,
          modifiedAt: undefined,
          fileSize: value.file.size,
          filename,
          extension,
          url: reader.result as string,
          image: {
            width: image.width,
            height: image.height,
            format: ''
          }
        }

        dispatch({
          type: ContentEditActionEnum.update,
          path: [...schemaPath, 'focalPoint'],
          value: {x: 0.5, y: 0.5}
        })
        dispatch({
          type: ContentEditActionEnum.update,
          path: [...schemaPath, 'media'],
          value: mediaDetail
        })
      }

      reader.addEventListener('load', handleReaderLoad)
      image.addEventListener('load', handleImageLoad)

      reader.readAsDataURL(value.file)

      return () => {
        reader.removeEventListener('load', handleReaderLoad)
        image.removeEventListener('load', handleImageLoad)
      }
    }

    return () => {
      /* do nothing */
    }
  }, [value?.file])

  async function handleDrop(files: File[]) {
    if (files.length === 0) return
    const file = files[0]
    dispatch({
      type: ContentEditActionEnum.update,
      path: [...schemaPath],
      value: {
        file
      }
    })
  }

  let panel

  if (value?.media?.image) {
    const {url, image, createdAt, modifiedAt, fileSize, extension, filename} = value?.media
    const {width, height} = image

    panel = (
      <>
        <div className="wep-media-panel" style={{backgroundColor: 'dark'}}>
          <FocalPointInput
            imageURL={url}
            imageWidth={width}
            imageHeight={height}
            maxHeight={300}
            focalPoint={value.focalPoint}
            onChange={point => {
              dispatch({
                type: ContentEditActionEnum.update,
                path: [...schemaPath, 'focalPoint'],
                value: point
              })
            }}
          />
        </div>
        <div
          className="wep-media-meta"
          style={{paddingLeft: 5, paddingRight: 10, paddingTop: 20, paddingBottom: 20}}>
          <DescriptionList>
            <DescriptionListItem label={t('images.panels.filename')}>
              {filename || t('images.panels.untitled')}
              {extension}
            </DescriptionListItem>
            <DescriptionListItem label={t('images.panels.dimension')}>
              {t('images.panels.imageDimension', {width, height})}
            </DescriptionListItem>
            {createdAt && (
              <DescriptionListItem label={t('images.panels.created')}>
                {new Date(createdAt).toLocaleString()}
              </DescriptionListItem>
            )}
            {modifiedAt && (
              <DescriptionListItem label={t('images.panels.updated')}>
                {new Date(modifiedAt).toLocaleString()}
              </DescriptionListItem>
            )}
            <DescriptionListItem label={t('images.panels.fileSize')}>
              {prettyBytes(fileSize)}
            </DescriptionListItem>
          </DescriptionList>
          <Button
            appearance="ghost"
            color="red"
            onClick={() => {
              dispatch({
                type: ContentEditActionEnum.update,
                path: [...schemaPath],
                value: null
              })
            }}>
            {t('global.buttons.delete')}
          </Button>
        </div>
      </>
    )
  } else if (value?.file || value?.media?.filename) {
    let name = ''
    if (value?.media?.filename && value?.media?.extension) {
      name = value.media.filename + value.media.extension
    } else {
      name = value.file.name
    }
    panel = (
      <Panel bodyFill={true} style={{height: '180px'}}>
        <Button
          onClick={() => {
            dispatch({
              type: ContentEditActionEnum.update,
              path: [...schemaPath],
              value: null
            })
          }}>
          {t('global.buttons.delete')}
        </Button>
        <FileDropInput disabled={true} text={name} onDrop={handleDrop} />
      </Panel>
    )
  } else {
    panel = (
      <Panel bodyFill={true} style={{height: '150px'}}>
        <FileDropInput
          icon={<Icon icon="upload" />}
          text={t('global.buttons.dropMedia')}
          onDrop={handleDrop}
        />
      </Panel>
    )
  }

  return panel
}

export default memo(BlockMedia, (a, b) => {
  return Object.is(a.value, b.value)
})
