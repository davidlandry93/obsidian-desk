import { App } from 'obsidian';
import { getAPI, isPluginEnabled, DataviewApi } from 'obsidian-dataview'
import { DateTime } from 'luxon'

type Link = any


export interface DataviewFile {
    ctime: DateTime,
    mtime: DateTime,
    name: string,
    path: string,
    size: number,
    folder: string,
    inlinks: Link[]
}

export function getDataviewAPI(app: App): DataviewApi {
    if (isPluginEnabled(app)) {
        const api = getAPI(app)
        
        if (api) {
            return api
        }
    }

    throw new Error("Could not access Dataview API")
}