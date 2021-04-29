import React, {memo, useState} from 'react'
import {Modal, Drawer} from 'rsuite'
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
  dispatch,
  configs
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
      <Drawer
        placement={'bottom'}
        show={isChooseModalOpen}
        full
        onHide={() => setChooseModalOpen(false)}>
        <RefSelectModal
          configs={configs}
          refConfig={model.types}
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
      </Drawer>
    </>
  )
}

export default memo(BlockRef, (a, b) => {
  return Object.is(a.value, b.value)
})
