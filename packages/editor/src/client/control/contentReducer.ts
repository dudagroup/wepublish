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
  path: SchemaPath
  value: unknown
}

export interface ContentEditActionSplice extends ContentEditActionBase {
  type: ContentEditActionEnum.splice
  path: SchemaPath
  start: number
  delete?: number
  insert?: unknown[]
}

export interface ContentEditActionPush extends ContentEditActionBase {
  type: ContentEditActionEnum.push
  path: SchemaPath
  insert: unknown[]
}

export interface ContentEditActionUnset extends ContentEditActionBase {
  type: ContentEditActionEnum.unset
  path: SchemaPath
  keys: SchemaPath
}

function createSpec(path: SchemaPath, spec: CustomCommands<any>) {
  const record = path.reverse().reduce((accu, item) => {
    return {[item]: accu}
  }, spec)
  return {record}
}

export function contentReducer(state: any, action: ContentEditAction) {
  switch (action.type) {
    case ContentEditActionEnum.setInitialState: {
      const actionInitial = action as ContentEditActionInitial
      return update(state, createSpec([], {$set: actionInitial.value}))
    }

    case ContentEditActionEnum.update: {
      const actionUpdate = action as ContentEditActionUpdate
      return update(state, createSpec(actionUpdate.path, {$set: actionUpdate.value}))
    }

    case ContentEditActionEnum.splice: {
      const actionSplice = action as ContentEditActionSplice
      const insert = actionSplice.insert || []
      return update(
        state,
        createSpec(actionSplice.path, {
          $splice: [[actionSplice.start, actionSplice.delete || 0, ...insert]]
        })
      )
    }

    case ContentEditActionEnum.push: {
      const actionPush = action as ContentEditActionPush
      return update(
        state,
        createSpec(actionPush.path, {
          $push: actionPush.insert
        })
      )
    }

    case ContentEditActionEnum.unset: {
      const actionUnset = action as ContentEditActionUnset
      return update(
        state,
        createSpec(actionUnset.path, {
          $unset: actionUnset.keys
        })
      )
    }

    default:
      throw new Error()
  }
}
