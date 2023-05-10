
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
    const query = filters.map(filterToQueryTerm).join(" and ")

    return query
}


export function keyOfFilter(f: Filter) {
    return f.value
}


