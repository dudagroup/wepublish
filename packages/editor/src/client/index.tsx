import {initClient} from './client'
import {EditorConfig} from './interfaces/extensionConfig'

import 'rsuite/lib/styles/index.less'
import './global.less'
import './atoms/emojiPicker.less'
import './atoms/toolbar.less'
import './blocks/richTextBlock/toolbar/tableMenu.less'

const config: EditorConfig = {}
if (document.readyState !== 'loading') {
  initClient(config)
} else {
  document.addEventListener('DOMContentLoaded', () => {
    initClient(config)
  })
}
