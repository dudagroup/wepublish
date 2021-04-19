import React, {useRef, useEffect} from 'react'
import {TypographicTextArea} from '../atoms/typographicTextArea'
import {BlockProps} from '../atoms/blockList'
import {useTranslation} from 'react-i18next'
import {TitleBlockValue} from './types'

export type TitleBlockProps = BlockProps<TitleBlockValue>

export function TitleBlock({value, onChange, autofocus, disabled}: TitleBlockProps) {
  const {title, lead} = value
  const focusRef = useRef<HTMLTextAreaElement>(null)

  const {t} = useTranslation()

  useEffect(() => {
    if (autofocus) focusRef.current?.focus()
  }, [])

  return (
    <>
      <TypographicTextArea
        ref={focusRef}
        variant="title"
        align="center"
        placeholder={t('blocks.title.title')}
        value={title}
        disabled={disabled}
        onChange={e => {
          onChange(e.target.value, ['title'])
        }}
      />
      <TypographicTextArea
        variant="body1"
        align="center"
        placeholder={t('blocks.title.leadText')}
        value={lead}
        disabled={disabled}
        onChange={e => {
          onChange(e.target.value, ['lead'])
        }}
      />
    </>
  )
}
