import {initClient} from '@dudagroup/editor'
import {config} from './config/config'

import 'rsuite/lib/styles/index.less'
import '@dudagroup/editor/src/client/global.less'
import '@dudagroup/editor/src/client/atoms/emojiPicker.less'
import '@dudagroup/editor/src/client/atoms/toolbar.less'
import '@dudagroup/editor/src/client/blocks/richTextBlock/toolbar/tableMenu.less'

if (document.readyState !== 'loading') {
  initClient(config)
} else {
  document.addEventListener('DOMContentLoaded', () => {
    initClient(config)
  })
}
