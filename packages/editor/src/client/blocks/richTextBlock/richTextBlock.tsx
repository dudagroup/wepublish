import React, {memo, useMemo, useState, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {createEditor, Location, Node as SlateNode, Transforms} from 'slate'
import {withHistory} from 'slate-history'
import {withReact, ReactEditor, Editable, Slate} from 'slate-react'
import {BlockProps} from '../../atoms/blockList'
import {EmojiPicker} from '../../atoms/emojiPicker'
import {Toolbar, ToolbarDivider, SubMenuButton, SubMenuDrawerButton} from '../../atoms/toolbar'
import {RichTextBlockValue} from '../types'
import {FormatButton, FormatIconButton, EditorSubMenuButton} from './toolbar/buttons'
import {renderElement, renderLeaf} from './editor/render'
import {BlockFormat, InlineFormat, TextFormat} from './editor/formats'
import {withRichText, withTable} from './editor/plugins'
import {withNormalizeNode} from './editor/normalizing'
import {TableMenu} from './toolbar/tableMenu'
import {WepublishEditor} from './editor/wepublishEditor'
import {LinkMenu} from './toolbar/linkMenu'
import {RefMenu} from './toolbar/refMenu'
import {ContentModelSchemaFieldRefTypeMap} from '../../interfaces/contentModelSchema'

export interface RichTextConfig {
  h1?: boolean
  h2?: boolean
  h3?: boolean
  h4?: boolean
  h5?: boolean
  h6?: boolean
  italic?: boolean
  bold?: boolean
  underline?: boolean
  strikethrough?: boolean
  superscript?: boolean
  subscript?: boolean
  table?: boolean
  emoji?: boolean
  unorderedList?: boolean
  orderedList?: boolean
  url?: boolean
  ref?: ContentModelSchemaFieldRefTypeMap
}

export interface RichTextBlockProps extends BlockProps<RichTextBlockValue> {
  displayOnly?: boolean
  showCharCount?: boolean
  displayOneLine?: boolean
  config?: RichTextConfig
}

export const RichTextBlock = memo(function RichTextBlock({
  value,
  autofocus,
  disabled,
  onChange,
  displayOnly = false,
  showCharCount = false,
  displayOneLine = false,
  config = {
    h1: true,
    h2: true,
    h3: true,
    h4: false,
    h5: false,
    h6: false,
    italic: true,
    bold: true,
    underline: true,
    strikethrough: true,
    superscript: true,
    subscript: true,
    table: true,
    emoji: true,
    unorderedList: true,
    orderedList: true,
    url: true,
    ref: undefined
  }
}: RichTextBlockProps) {
  const editor = useMemo(
    () => withNormalizeNode(withTable(withRichText(withHistory(withReact(createEditor()))))),
    []
  )
  const [hasFocus, setFocus] = useState(false)
  const [location, setLocation] = useState<Location | null>(null)

  const [charCount, setCharCount] = useState(0)

  useEffect(() => {
    setCharCount(WepublishEditor.calculateEditorCharCount(editor))
  }, [editor.children])

  const {t} = useTranslation()

  useEffect(() => {
    if (autofocus) {
      ReactEditor.focus(editor)
    }
  }, [])

  const focusAtPreviousLocation = (location: Location) => {
    Transforms.select(editor, location)
    ReactEditor.focus(editor)
  }

  const activateHotkey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key.toLowerCase()) {
      case 'b': {
        e.preventDefault()
        WepublishEditor.toggleFormat(editor, TextFormat.Bold)
        break
      }
      case 'i': {
        e.preventDefault()
        WepublishEditor.toggleFormat(editor, TextFormat.Italic)
        break
      }
      case 'u': {
        e.preventDefault()
        WepublishEditor.toggleFormat(editor, TextFormat.Underline)
        break
      }
      case 'x': {
        if (e.getModifierState('Shift')) {
          e.preventDefault()
          WepublishEditor.toggleFormat(editor, TextFormat.Strikethrough)
        }
        break
      }
    }
  }

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(newValue: SlateNode[]) => {
        setFocus(ReactEditor.isFocused(editor))
        if (value !== newValue) {
          onChange(newValue)
        }
      }}>
      {!displayOnly && (
        <>
          <Toolbar
            fadeOut={!hasFocus}
            onMouseDown={() => {
              // e.preventDefault()
              if (!hasFocus && location) focusAtPreviousLocation(location)
            }}>
            {config.h1 && (
              <FormatButton format={BlockFormat.H1}>
                <b style={{fontSize: 13}}>H1</b>
              </FormatButton>
            )}
            {config.h2 && (
              <FormatButton format={BlockFormat.H2}>
                <b style={{fontSize: 13}}>H2</b>
              </FormatButton>
            )}
            {config.h3 && (
              <FormatButton format={BlockFormat.H3}>
                <b style={{fontSize: 13}}>H3</b>
              </FormatButton>
            )}
            {config.h4 && (
              <FormatButton format={BlockFormat.H4}>
                <b style={{fontSize: 13}}>H4</b>
              </FormatButton>
            )}
            {config.h5 && (
              <FormatButton format={BlockFormat.H5}>
                <b style={{fontSize: 13}}>H5</b>
              </FormatButton>
            )}
            {config.h6 && (
              <FormatButton format={BlockFormat.H6}>
                <b style={{fontSize: 13}}>H6</b>
              </FormatButton>
            )}
            {(config.h1 || config.h2 || config.h3 || config.h4 || config.h5 || config.h6) && (
              <ToolbarDivider />
            )}

            {config.unorderedList && (
              <FormatIconButton icon="list-ul" format={BlockFormat.UnorderedList} />
            )}
            {config.orderedList && (
              <FormatIconButton icon="list-ol" format={BlockFormat.OrderedList} />
            )}

            {(config.orderedList || config.unorderedList) && <ToolbarDivider />}

            {config.table && (
              <>
                <EditorSubMenuButton icon="table" editorHasFocus={hasFocus}>
                  <TableMenu />
                </EditorSubMenuButton>
                <ToolbarDivider />
              </>
            )}

            {config.bold && <FormatIconButton icon="bold" format={TextFormat.Bold} />}
            {config.italic && <FormatIconButton icon="italic" format={TextFormat.Italic} />}
            {config.underline && (
              <FormatIconButton icon="underline" format={TextFormat.Underline} />
            )}
            {config.strikethrough && (
              <FormatIconButton icon="strikethrough" format={TextFormat.Strikethrough} />
            )}
            {config.superscript && (
              <FormatIconButton icon="superscript" format={TextFormat.Superscript} />
            )}
            {config.subscript && (
              <FormatIconButton icon="subscript" format={TextFormat.Subscript} />
            )}
            {(config.bold ||
              config.italic ||
              config.underline ||
              config.strikethrough ||
              config.superscript ||
              config.subscript) && <ToolbarDivider />}

            {config?.url && (
              <>
                <SubMenuButton icon="link" format={InlineFormat.Link}>
                  <LinkMenu />
                </SubMenuButton>
                <ToolbarDivider />
              </>
            )}

            {config?.ref && (
              <>
                <SubMenuDrawerButton icon="paste" format={InlineFormat.Reference}>
                  <RefMenu types={config?.ref} />
                </SubMenuDrawerButton>
                <ToolbarDivider />
              </>
            )}

            {config.emoji && (
              <SubMenuButton icon="smile-o">
                <EmojiPicker setEmoji={emoji => editor.insertText(emoji)} />
              </SubMenuButton>
            )}
          </Toolbar>
          {/* {WepublishEditor.isEmpty(editor) && ( // Alternative placeholder
            <div onClick={() => ReactEditor.focus(editor)} style={{color: '#cad5e4'}}>
              {t('blocks.richText.startWriting')}
            </div>
          )} */}
        </>
      )}
      <Editable
        style={
          displayOneLine
            ? {
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }
            : undefined
        }
        readOnly={disabled || displayOnly}
        placeholder={t('blocks.richText.startWriting')}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onBlur={() => {
          setLocation(editor.selection)
        }}
        onKeyDown={e => {
          if (e.getModifierState('Shift') && e.key.toLowerCase() === 'enter') {
            e.preventDefault()
            editor.insertText('\n')
          }
          if (e.ctrlKey || e.metaKey) activateHotkey(e)
        }}
      />
      {showCharCount && (
        <p style={{textAlign: 'right'}}>{t('blocks.richText.charCount', {charCount: charCount})}</p>
      )}
    </Slate>
  )
})

export function createDefaultValue(): RichTextBlockValue {
  return WepublishEditor.createDefaultValue()
}
