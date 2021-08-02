import React from 'react'
import {CusomExtension} from '../interfaces/extensionConfig'

export interface ArticleEditorProps {
  readonly customExtensionConfig: CusomExtension
}

export function Extension({customExtensionConfig}: ArticleEditorProps) {
  return <>{customExtensionConfig.view}</>
}
