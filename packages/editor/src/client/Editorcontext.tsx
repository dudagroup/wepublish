import React from 'react'
import {Configs} from './interfaces/extensionConfig'

export const ConfigContext = React.createContext<Configs | undefined>(undefined)
