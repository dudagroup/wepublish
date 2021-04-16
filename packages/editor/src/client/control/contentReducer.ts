import {SchemaPath} from '../interfaces/utilTypes'
import update, {CustomCommands} from 'immutability-helper'

export enum ContentEditActionEnum {
  setInitialState = 'setInitialState',
  update = 'update',
  splice = 'splice',
  push = 'push',
  unset = 'unset'
}
export type ContentEditAction =
  | ContentEditActionInitial
  | ContentEditActionUpdate
  | ContentEditActionSplice
  | ContentEditActionPush
  | ContentEditActionUnset

export interface ContentEditActionBase {
  type: ContentEditActionEnum
}

export interface ContentEditActionInitial extends ContentEditActionBase {
  type: ContentEditActionEnum
  value: unknown
}

export interface ContentEditActionUpdate extends ContentEditActionBase {
  type: ContentEditActionEnum.update
  schemaPath: SchemaPath
  value: unknown
}

export interface ContentEditActionSplice extends ContentEditActionBase {
  type: ContentEditActionEnum.splice
  schemaPath: SchemaPath
  start: number
  delete: number
  insert: any[]
}

export interface ContentEditActionPush extends ContentEditActionBase {
  type: ContentEditActionEnum.push
  schemaPath: SchemaPath
  insert: any[]
}

export interface ContentEditActionUnset extends ContentEditActionBase {
  type: ContentEditActionEnum.unset
  schemaPath: SchemaPath
  keys: SchemaPath
}

export function contentReducer(state: any, action: ContentEditAction) {
  switch (action.type) {
    case ContentEditActionEnum.setInitialState:
      const actionInitial = action as ContentEditActionInitial
      return actionInitial.value

    case ContentEditActionEnum.update:
      const actionUpdate = action as ContentEditActionUpdate
      let updateOperation: CustomCommands<any> = {$set: actionUpdate.value}
      updateOperation = actionUpdate.schemaPath.reverse().reduce((accu, item) => {
        return {[item]: accu}
      }, updateOperation)
      return update(state, updateOperation)

    case ContentEditActionEnum.splice:
      const actionSplice = action as ContentEditActionSplice
      let spliceOperation: CustomCommands<any> = {
        $splice: [[actionSplice.start, actionSplice.delete, ...actionSplice.insert]]
      }
      spliceOperation = actionSplice.schemaPath.reverse().reduce((accu, item) => {
        return {[item]: accu}
      }, spliceOperation)
      return update(state, spliceOperation)

    case ContentEditActionEnum.push:
      const actionPush = action as ContentEditActionPush
      let pushOperation: CustomCommands<any> = {
        $push: actionPush.insert
      }
      pushOperation = actionPush.schemaPath.reverse().reduce((accu, item) => {
        return {[item]: accu}
      }, pushOperation)
      return update(state, pushOperation)

    case ContentEditActionEnum.unset:
      const actionUnset = action as ContentEditActionUnset
      let unsetOperation: CustomCommands<any> = {
        $unset: actionUnset.keys
      }
      pushOperation = actionUnset.schemaPath.reverse().reduce((accu, item) => {
        return {[item]: accu}
      }, pushOperation)
      return update(state, unsetOperation)

    default:
      throw new Error()
  }
}
