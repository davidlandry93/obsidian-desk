
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

export type Filter = TagFilter | TextFilter | LinkFilter | FolderFilter

function filterToQueryTerm(filter: Filter): string {
    if (filter.type === "tag") {
        return filter.value
    } else if (filter.type === "link") {
        return "[[" + filter.value + "]]"
    } else if (filter.type === "folder") {
        return "\"" + filter.value + "\""
    }
    throw new Error("Unhandled filter type")
}

export function filtersToDataviewQuery(filters: Filter[]) {
    const query = filters.map(filterToQueryTerm).join(" and ")

    return query
}


