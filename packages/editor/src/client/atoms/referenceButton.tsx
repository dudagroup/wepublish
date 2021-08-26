import React from 'react'
import {useTranslation} from 'react-i18next'
import {Button} from 'rsuite'
import {Reference} from '../interfaces/referenceType'
import {ReferencePreview} from './referencePreview'

export function ReferenceButton({
  reference,
  onClick,
  onClose,
  disabled
}: {
  readonly reference?: Reference | null
  readonly disabled?: boolean
  readonly onClose: (event: React.MouseEvent<HTMLElement>) => void
  readonly onClick: () => void
}) {
  const {t} = useTranslation()
  let ref = null
  if (reference) {
    ref = <ReferencePreview reference={reference} onClose={onClose} />
  } else {
    ref = (
      <Button disabled={disabled} appearance="ghost" active onClick={onClick}>
        {t('global.buttons.referenceTo')}
      </Button>
    )
  }
  return ref
}
