
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

export type Filter = TagFilter | TextFilter | LinkFilter

function filterToQueryTerm(filter: Filter): string {
    if (filter.type === "tag") {
        return filter.value
    } else if (filter.type === "link") {
        return "[[" + filter.value + "]]"
    }
    throw new Error("Unhandled filter type")
}

export function filtersToDataviewQuery(filters: Filter[]) {
    console.log("Input filters", filters)
    const query = filters.map(filterToQueryTerm).join(" and ")

    return query
}


