import equal from 'deep-equal'
import { DataviewFile } from './dataview'
import { TFile } from 'obsidian'


export interface BasicFilter {
    type: "tag" | "folder" | "backlink"
    value: string
    reversed: boolean
}

export interface TextFilter {
    type: "text",
    value: string,
    reversed: boolean
}

export interface LinkFilter {
    type: "link"
    value: string
    reversed: boolean
    exists: boolean
    alias?: string
}


export type Filter = BasicFilter | LinkFilter | TextFilter

function filterToQueryTerm(filter: Filter): string {
    let baseString = ''

    if (filter.type === "tag") {
        baseString = filter.value
    } else if (filter.type === "link") {
        baseString = "[[" + filter.value + "]]"
    } else if (filter.type === "folder") {
        baseString = "\"" + filter.value + "\""
    } else if (filter.type === "backlink") {
        baseString = `outgoing([[${filter.value}]])`
    } else if (filter.type === "text"){
        // Text filters have to be handled later, after the dataview query.
        return ""
    } else {
        throw new Error("Unhandled filter type")
    }
    
    if (filter.reversed) {
        baseString = "!" + baseString
    }

    return baseString
}

export function filtersToDataviewQuery(filters: Filter[]) {
    const query = filters.map(filterToQueryTerm).join(" and ")

    return query
}

export function keyOfFilter(f: Filter) {
    if (f.type === 'link') {
        return keyOfLinkFilter(f)
    } else {
        return `${f.type}:${f.value}`
    }
}

function keyOfLinkFilter(f: LinkFilter) {
    const keyBody = 'alias' in f ? f.alias : f.value
    const aliasTag = 'alias' in f ? 'alias:' : ''
    const existTag = !f.exists ? 'nofile:' : ''

    const key = `${f.type}:${aliasTag}${existTag}${keyBody}`

    return key
}

export function filterEqual(a: Filter, b: Filter) {
    return equal(a, b)
}


export async function fileMatchesFilter(file: DataviewFile, filter: Filter): Promise<boolean> {
    if (filter.type === "text") {
        const fileHandle = app.vault.getAbstractFileByPath(file.path)

        if (fileHandle instanceof TFile) {
            const fileContent = await app.vault.cachedRead(fileHandle)

            return fileContentMatchesTextFilter(fileContent, filter)
        } else {
            throw new Error("Unexpected type of FileHandle")
        }
    } else {
        throw new Error(`Filter of type ${filter.type} should not be applied directly to file, but done with dataview instead.`)
    }
}

export function fileContentMatchesTextFilter(fileContent: string, filter: TextFilter): boolean {
    return fileContent.contains(filter.value)
}