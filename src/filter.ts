
export interface TagFilter {
    type: "tag",
    value: string,
}

export interface TextFilter {
    type: "text",
    value: string,
}

export interface LinkFilter {
    type: "link",
    value: string,
    exists: boolean,
    alias?: string,
}

export interface FolderFilter {
    type: "folder",
    value: string,
}

export interface BacklinkFilter {
    type: "backlink",
    value: string,
}

export type Filter = TagFilter | TextFilter | LinkFilter | FolderFilter | BacklinkFilter

function filterToQueryTerm(filter: Filter): string {
    console.log(filter)

    if (filter.type === "tag") {
        return filter.value
    } else if (filter.type === "link") {
        return "[[" + filter.value + "]]"
    } else if (filter.type === "folder") {
        return "\"" + filter.value + "\""
    } else if (filter.type === "backlink") {
        return `outgoing([[${filter.value}]])`
    }
    throw new Error("Unhandled filter type")
}

export function filtersToDataviewQuery(filters: Filter[]) {
    console.log("Filter to query")
    console.log(filters)
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
