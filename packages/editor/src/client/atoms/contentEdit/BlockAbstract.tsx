import React, {memo} from 'react'
import BlockObject, {LanguageContext} from './BlockObject'
import BlockString from './BlockString'
import BlockEnum from './BlockEnum'
import BlockFloat from './BlockFloat'
import BlockBoolean from './BlockBoolean'
import BlockList from './BlockList'
import BlockUnion from './BlockUnion'
import BlockRef from './BlockRef'
import {ContentModelSchemaTypes} from '../../interfaces/contentModelSchema'
import BlockInt from './BlockInt'
import {SchemaPath} from '../../interfaces/utilTypes'
import BlockRichText from './BlockRichText'
import {ContentEditAction} from '../../control/contentReducer'
import BlockDateTime from './BlockDateTime'
import BlockMedia from './BlockMedia'
import {Configs} from '../../interfaces/extensionConfig'

export interface BlockAbstractProps<M = any, V = any> {
  readonly schemaPath: SchemaPath
  readonly dispatch: React.Dispatch<ContentEditAction>
  readonly value: V
  readonly model: M
  readonly languageContext: LanguageContext
  readonly configs: Configs
  readonly disabled?: boolean
}

function BlockAbstract(props: BlockAbstractProps) {
  if (!props.model) {
    return null
  }

  let block: any = null
  if (props.model.type === ContentModelSchemaTypes.object) {
    block = <BlockObject {...props}></BlockObject>
  } else if (
    props.model.type === ContentModelSchemaTypes.string ||
    props.model.type === ContentModelSchemaTypes.id
  ) {
    block = <BlockString {...props}></BlockString>
  } else if (props.model.type === ContentModelSchemaTypes.richText) {
    block = <BlockRichText {...props}></BlockRichText>
  } else if (props.model.type === ContentModelSchemaTypes.enum) {
    block = <BlockEnum {...props}></BlockEnum>
  } else if (props.model.type === ContentModelSchemaTypes.int) {
    block = <BlockInt {...props}></BlockInt>
  } else if (props.model.type === ContentModelSchemaTypes.float) {
    block = <BlockFloat {...props}></BlockFloat>
  } else if (props.model.type === ContentModelSchemaTypes.boolean) {
    block = <BlockBoolean {...props}></BlockBoolean>
  } else if (props.model.type === ContentModelSchemaTypes.list) {
    block = <BlockList {...props}></BlockList>
  } else if (props.model.type === ContentModelSchemaTypes.union) {
    block = <BlockUnion {...props}></BlockUnion>
  } else if (props.model.type === ContentModelSchemaTypes.reference) {
    block = <BlockRef {...props}></BlockRef>
  } else if (props.model.type === ContentModelSchemaTypes.dateTime) {
    block = <BlockDateTime {...props}></BlockDateTime>
  } else if (props.model.type === ContentModelSchemaTypes.media) {
    block = <BlockMedia {...props}></BlockMedia>
  }

  return <>{block}</>
}

export default memo(BlockAbstract, (a, b) => {
  return (
    Object.is(a.value, b.value) &&
    a.schemaPath.concat('') === b.schemaPath.concat('') &&
    Object.is(a.languageContext.langLane1, b.languageContext.langLane1) &&
    Object.is(a.languageContext.langLane2, b.languageContext.langLane2)
  )
})
