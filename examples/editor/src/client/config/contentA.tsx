import React, {useState} from 'react'
import {FormControl, Grid, Panel, Drawer} from 'rsuite'
import {
  RichTextBlock,
  RichTextBlockValue,
  Reference,
  RefSelectDrawer,
  ReferenceButton,
  Configs
} from '@dudagroup/editor'
import {ContentContextEnum} from './article/api'
import {I18nWrapper} from './i18nWrapper'
import {
  ContentEditAction,
  ContentEditActionEnum
} from '@dudagroup/editor/lib/client/control/contentReducer'
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
  readonly langLaneL: string
  readonly langLaneR: string
}

export function ContentAEditView({
  value,
  dispatch,
  configs,
  langLaneL,
  langLaneR
}: ContentAEditViewProps) {
  const {myString, myStringI18n, myRichText, myRichTextI18n, myRef} = value
  const [isChooseModalOpen, setChooseModalOpen] = useState(false)

  return (
    <>
      <Grid>
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
            value={myStringI18n[langLaneL]}
            display={myStringI18n[langLaneR]}>
            <FormControl
              value={myStringI18n[langLaneL]}
              onChange={value => {
                dispatch({
                  type: ContentEditActionEnum.update,
                  path: ['myStringI18n', langLaneL],
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
                  value={myRichTextI18n[langLaneR]}
                  onChange={richText => {
                    const value = isFunctionalUpdate(richText)
                      ? richText(myRichTextI18n[langLaneR])
                      : richText
                    dispatch({
                      type: ContentEditActionEnum.update,
                      path: ['myRichTextI18n', langLaneR],
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
                value={myRichTextI18n[langLaneL]}
                onChange={richText => {
                  const value = isFunctionalUpdate(richText)
                    ? richText(myRichTextI18n[langLaneL])
                    : richText
                  dispatch({
                    type: ContentEditActionEnum.update,
                    path: ['myRichTextI18n', langLaneL],
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

      <Drawer
        show={isChooseModalOpen}
        placement={'bottom'}
        full
        onHide={() => setChooseModalOpen(false)}>
        <RefSelectDrawer
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
      </Drawer>
    </>
  )
}
