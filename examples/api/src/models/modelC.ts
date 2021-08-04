import {ContentModel} from '@dudagroup/api'
import {mySharedEnum, mySharedObject, mySharedUnion} from './sharedObject'

export const contentModelC: ContentModel = {
  identifier: 'modelC',
  nameSingular: 'Model C',
  namePlural: 'Models C',
  schema: {
    content: {
      myScharedObject: mySharedObject,
      myScharedEnum: mySharedEnum,
      mySharedUnion: mySharedUnion
    }
  }
}
