import React from 'react'

import {BlockProps} from '../atoms/blockList'
import {RichTextBlockExampleValue} from './types'
import {RichTextBlock} from '@wepublish/editor'

export type RichTextBlockProps = BlockProps<RichTextBlockExampleValue>

export function RichTextBlockExampleBlock({
  value,
  onChangeNew,
  autofocus,
  disabled
}: RichTextBlockProps) {
  const {richText} = value
  return (
    <RichTextBlock
      value={richText}
      onChange={val => {
        onChangeNew(val, ['richText'])
      }}
      autofocus={autofocus}
      disabled={disabled}
    />
  )
}
