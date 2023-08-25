import equal from 'deep-equal'
import { DataviewFile } from './dataview'
import { TFile, App } from 'obsidian'


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
    } else if (filter.type === "text") {
        throw new Error("Text filters should not be included in dataview queries")
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


export function fileContentMatchesTextFilter(fileContent: string, filter: TextFilter): boolean {
    return fileContent.toLowerCase().contains(filter.value.toLowerCase())
}