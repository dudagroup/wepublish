import {SchemaPath} from '../interfaces/utilTypes'
import update, {CustomCommands} from 'immutability-helper'

export enum ContentEditActionEnum {
  setInitialState = 'setInitialState',
  update = 'update',
  splice = 'splice',
  swap = 'swap',
  push = 'push',
  unset = 'unset',
  hasChanged = 'hasChanged'
}
export type ContentEditAction =
  | ContentEditActionInitial
  | ContentEditActionUpdate
  | ContentEditActionSplice
  | ContentEditActionPush
  | ContentEditActionUnset
  | ContentEditActionSwap

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

export interface ContentEditActionSwap extends ContentEditActionBase {
  type: ContentEditActionEnum.swap
  path: SchemaPath
  index: number
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

export interface ContentEditActionHasChanged extends ContentEditActionBase {
  type: ContentEditActionEnum.hasChanged
  value: boolean
}

function createSpec(path: SchemaPath, spec: CustomCommands<any>, hasChanged = true) {
  const record = path.reverse().reduce((accu, item) => {
    return {[item]: accu}
  }, spec)
  return {record, hasChanged: {$set: hasChanged}}
}

interface State {
  record: any
  hasChanged: boolean
}

export function contentReducer(state: State, action: ContentEditAction) {
  switch (action.type) {
    case ContentEditActionEnum.hasChanged: {
      const actionHasChanged = action as ContentEditActionHasChanged
      return update(state, {hasChanged: {$set: actionHasChanged.value}})
    }

    case ContentEditActionEnum.setInitialState: {
      const actionInitial = action as ContentEditActionInitial
      return update(state, createSpec([], {$set: actionInitial.value}, false))
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

    case ContentEditActionEnum.swap: {
      const actionSwap = action as ContentEditActionSwap
      return update(
        state,
        createSpec(actionSwap.path, {
          $apply: (current: unknown[]) => {
            const a = current[actionSwap.index]
            const b = current[actionSwap.index + 1]
            return update(current, {
              $splice: [[actionSwap.index, 2, b, a]]
            })
          }
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
