import React, {useContext, useMemo, useState} from 'react'
import {Button, Icon, Col, FormControl, Grid, Modal, Row, SelectPicker, Panel} from 'rsuite'
import {
  RichTextBlock,
  RichTextBlockValue,
  Reference,
  RefSelectModal,
  ReferenceButton,
  ConfigContext,
  Configs
} from '@wepublish/editor'
import {ContentContextEnum} from './article/api'
import {I18nWrapper} from './i18nWrapper'
import {
  ContentEditAction,
  ContentEditActionEnum
} from '@wepublish/editor/lib/client/control/contentReducer'
import {isFunctionalUpdate} from '@karma.run/react'
import {MODEL_MEDIA_LIBRARY} from './config'

export interface ContentAEditViewValue {
  readonly myString: string
  readonly myStringI18n: {
    [lang: string]: string
  }
  readonly myRichText: RichTextBlockValue
  readonly myRichTextI18n: {
    [lang: string]: RichTextBlockValue
  }
  readonly myRef?: Reference | null
}

export interface ContentAEditViewProps {
  readonly value: ContentAEditViewValue
  readonly dispatch: React.Dispatch<ContentEditAction>
  readonly configs: Configs
}

export function ContentAEditView({value, dispatch, configs}: ContentAEditViewProps) {
  const config = useContext(ConfigContext)

  const [editLang, setEditLang] = useState(config.apiConfig.languages.languages[0].tag)
  const [viewLang, setViewLang] = useState(config.apiConfig.languages.languages[1].tag)

  const {myString, myStringI18n, myRichText, myRichTextI18n, myRef} = value
  const [isChooseModalOpen, setChooseModalOpen] = useState(false)

  const languages = config.apiConfig.languages.languages.map(v => {
    return {
      label: v.tag,
      value: v.tag
    }
  })
  const header = useMemo(() => {
    return (
      <Row className="show-grid">
        <Col xs={11}>
          <SelectPicker
            cleanable={false}
            data={languages}
            value={editLang}
            appearance="subtle"
            onChange={setEditLang}
            style={{width: 100}}
          />
        </Col>
        <Col xs={2} style={{textAlign: 'center'}}>
          <Button
            appearance="link"
            onClick={() => {
              setEditLang(viewLang)
              setViewLang(editLang)
            }}>
            {<Icon icon="exchange" />}
          </Button>
        </Col>
        <Col xs={11} style={{textAlign: 'right'}}>
          <SelectPicker
            cleanable={false}
            data={languages}
            value={viewLang}
            appearance="subtle"
            onChange={setViewLang}
            style={{width: 100}}
          />
        </Col>
      </Row>
    )
  }, [viewLang, editLang])

  return (
    <>
      <Grid>
        {header}
        <Panel bordered>
          <I18nWrapper label="myString" value={myString}>
            <FormControl
              value={myString}
              onChange={value => {
                dispatch({
                  type: ContentEditActionEnum.update,
                  path: ['myString'],
                  value
                })
              }}
            />
          </I18nWrapper>

          <I18nWrapper
            label="myStringI18n"
            value={myStringI18n[editLang]}
            display={myStringI18n[viewLang]}>
            <FormControl
              value={myStringI18n[editLang]}
              onChange={value => {
                dispatch({
                  type: ContentEditActionEnum.update,
                  path: ['myStringI18n', editLang],
                  value
                })
              }}
            />
          </I18nWrapper>

          <I18nWrapper label="myRichText">
            <Panel bordered>
              <RichTextBlock
                value={myRichText}
                onChange={richText => {
                  const value = isFunctionalUpdate(richText) ? richText(myRichText) : richText
                  dispatch({
                    type: ContentEditActionEnum.update,
                    path: ['myRichText'],
                    value
                  })
                }}
                config={{
                  bold: true,
                  italic: true,
                  url: true,
                  ref: {
                    modelA: {scope: ContentContextEnum.Local},
                    modelB: {scope: ContentContextEnum.Local},
                    [MODEL_MEDIA_LIBRARY]: {scope: ContentContextEnum.Local}
                  }
                }}
              />
            </Panel>
          </I18nWrapper>

          <I18nWrapper
            label="myRichTextI18n"
            display={
              <Panel bordered>
                <RichTextBlock
                  value={myRichTextI18n[viewLang]}
                  onChange={richText => {
                    const value = isFunctionalUpdate(richText)
                      ? richText(myRichTextI18n[viewLang])
                      : richText
                    dispatch({
                      type: ContentEditActionEnum.update,
                      path: ['myRichTextI18n', viewLang],
                      value
                    })
                  }}
                  displayOnly={true}
                  config={{
                    bold: true,
                    italic: true,
                    url: true,
                    ref: {
                      modelA: {scope: ContentContextEnum.Local},
                      modelB: {scope: ContentContextEnum.Local}
                    }
                  }}
                />
              </Panel>
            }>
            <Panel bordered>
              <RichTextBlock
                value={myRichTextI18n[editLang]}
                onChange={richText => {
                  const value = isFunctionalUpdate(richText)
                    ? richText(myRichTextI18n[editLang])
                    : richText
                  dispatch({
                    type: ContentEditActionEnum.update,
                    path: ['myRichTextI18n', editLang],
                    value
                  })
                }}
                config={{
                  bold: true,
                  italic: true,
                  url: true,
                  ref: {
                    modelA: {scope: ContentContextEnum.Local},
                    modelB: {scope: ContentContextEnum.Local}
                  }
                }}
              />
            </Panel>
          </I18nWrapper>

          <I18nWrapper label="myRef">
            <ReferenceButton
              reference={myRef}
              onClick={() => setChooseModalOpen(true)}
              onClose={() => {
                dispatch({
                  type: ContentEditActionEnum.update,
                  path: ['myRef'],
                  value: null
                })
              }}></ReferenceButton>
          </I18nWrapper>
        </Panel>
      </Grid>

      <Modal show={isChooseModalOpen} size="md" onHide={() => setChooseModalOpen(false)}>
        <RefSelectModal
          configs={configs}
          refConfig={{
            modelA: {scope: ContentContextEnum.Local},
            modelB: {scope: ContentContextEnum.Local}
          }}
          onClose={() => setChooseModalOpen(false)}
          onSelectRef={ref => {
            setChooseModalOpen(false)
            dispatch({
              type: ContentEditActionEnum.update,
              path: ['myRef'],
              value: ref
            })
          }}
        />
      </Modal>
    </>
  )
}
