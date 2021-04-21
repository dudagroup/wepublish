import React, {memo, useState} from 'react'
import {Modal} from 'rsuite'
import {ContentEditActionEnum} from '../../control/contentReducer'
import {ContentModelSchemaFieldRef} from '../../interfaces/contentModelSchema'
import {Reference} from '../../interfaces/referenceType'
import {RefSelectModal} from '../../panel/refSelectPanelModal'
import {ReferenceButton} from '../referenceButton'
import {BlockAbstractProps} from './BlockAbstract'

function BlockRef({
  value,
  schemaPath,
  model,
  dispatch
}: BlockAbstractProps<ContentModelSchemaFieldRef, Reference | null>) {
  const [isChooseModalOpen, setChooseModalOpen] = useState(false)

  return (
    <>
      <ReferenceButton
        reference={value}
        onClick={() => setChooseModalOpen(true)}
        onClose={() => {
          dispatch({
            type: ContentEditActionEnum.update,
            path: schemaPath,
            value: null
          })
        }}></ReferenceButton>
      <Modal show={isChooseModalOpen} size="lg" onHide={() => setChooseModalOpen(false)}>
        <RefSelectModal
          config={model.types}
          onClose={() => setChooseModalOpen(false)}
          onSelectRef={ref => {
            setChooseModalOpen(false)
            dispatch({
              type: ContentEditActionEnum.update,
              value: ref,
              path: schemaPath
            })
          }}
        />
      </Modal>
    </>
  )
}

export default memo(BlockRef, (a, b) => {
  return Object.is(a.value, b.value)
})
