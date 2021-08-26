import React, {useRef} from 'react'
import {IconButton, Whisper, Icon, Popover, Button} from 'rsuite'
import marked from 'marked'
import {useTranslation} from 'react-i18next'

// eslint-disable-next-line react/display-name
const Overlay = React.forwardRef(
  ({style, instructions, currentLanguage, key, onClose, ...rest}: any, ref) => {
    const {t} = useTranslation()
    const styles = {
      ...style,
      background: '#fff',
      width: 200,
      padding: 10,
      borderRadius: 6,
      position: 'absolute',
      boxShadow: '0 3px 6px -2px rgba(0, 0, 0, 0.6)'
    }

    function toComponent(html: string) {
      return <div dangerouslySetInnerHTML={{__html: html}} />
    }

    let instructionsWrapper = null
    if (instructions && typeof instructions === 'string') {
      instructionsWrapper = toComponent(marked(instructions as string))
    } else if (instructions?.[currentLanguage]) {
      instructionsWrapper = toComponent(marked(instructions?.[currentLanguage]))
    }
    return (
      <Popover {...rest} style={styles} ref={ref}>
        {instructionsWrapper}
        <Button onClick={onClose}>{t('global.buttons.close')}</Button>
      </Popover>
    )
  }
)

interface InstructionsProps {
  instructions?: string | any
  currentLanguage: string
}

function Instructions(propsInstructions: InstructionsProps) {
  const whisperRef = useRef<any>(null)

  if (!propsInstructions.instructions) {
    return null
  }

  return (
    <Whisper
      trigger="click"
      ref={whisperRef}
      clos
      speaker={(props, ref) => {
        const {className, left, top} = props
        return (
          <Overlay
            {...propsInstructions}
            style={{left, top}}
            onClose={() => {
              if (whisperRef?.current) {
                whisperRef?.current.close()
              }
            }}
            className={className}
            ref={ref}
          />
        )
      }}>
      <IconButton
        appearance="subtle"
        icon={<Icon icon="help-o" />}
        circle
        size="xs"
        style={{marginLeft: 10}}
      />
    </Whisper>
  )
}

export default Instructions
