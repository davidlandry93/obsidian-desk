import { App } from 'obsidian';
import { getAPI, isPluginEnabled, DataviewApi } from 'obsidian-dataview'


export function getDataviewAPI(app: App): DataviewApi {
    if (isPluginEnabled(app)) {
        const api = getAPI(app)
        
        if (api) {
            return api
        }
    }

    throw new Error("Could not access Dataview API")
}