import { createContext } from 'react'

import {App} from 'obsidian'

export const ObsidianContext = createContext<App | undefined>(undefined)