import React, { useState, useEffect } from 'react'
import { produce } from 'immer'
import { getDataviewAPI } from './dataview'


import { FilterMenu as FilterMenu } from './filtermenu'
import { BasicFilter, Filter, LinkFilter, TextFilter, filterEqual, filtersToDataviewQuery } from './filter'
import { ResultsDisplay } from './results'
import { SearchResult, dataviewFileToSearchResult } from './domain/searchresult'
import { MaybeSortOption } from './sortchip'
import { ExtendedMetadataCache } from 'src/obsidianprivate'
import { getMetadataCache } from './obsidian'
import { TFile } from 'obsidian'
import { DataviewFile } from './dataview'


function getTagSuggestions(): Filter[] {
    const metadataCache = getMetadataCache(app)
    return Object.keys(metadataCache.getTags()).map((t) => { return { type: "tag", value: t, key: t, reversed: false } })
}

function getFolderSuggestions(): BasicFilter[] {
    const folderPaths = app.vault.getAllLoadedFiles().filter(f => ('children' in f) && f.path !== '/').map(f => f.path)
    return folderPaths.map((p) => {
        return {
            type: 'folder',
            value: p,
            key: p,
            reversed: false,
        }
    })
}

function getLinkSuggestions(): LinkFilter[] {
    const metadataCache = app.metadataCache as ExtendedMetadataCache

    return metadataCache.getLinkSuggestions().map((s: any) => {
        const filter: LinkFilter = { type: "link", value: s.path, exists: s.file !== null, reversed: false }

        if ('alias' in s) {
            filter.alias = s.alias
        }

        return filter
    })
}

function getBacklinkSuggestions(): BasicFilter[] {
    const dv = getDataviewAPI(app)

    const allPages = dv.pages('""').values

    const withBacklinks = allPages.map((p: any) => p.file).filter((p: any) => p.outlinks.length > 0).map((p: any) => {
        return {
            type: "backlink",
            value: p.path,
            key: p.path
        }
    })
    return withBacklinks
}


function getAllSuggestions(): Filter[] {
    const suggestions = [
        ...getTagSuggestions(),
        ...getLinkSuggestions(),
        ...getFolderSuggestions(),
        ...getBacklinkSuggestions(),
    ]

    const suggestionOrder = (a: Filter, b: Filter) => {
        return a.value.length - b.value.length
    }

    return suggestions.sort(suggestionOrder)
}

interface DeskComponentState {
    filters: Filter[]
    sort: MaybeSortOption
}


export function DeskComponent() {
    const [state, setState] = useState<DeskComponentState>({
        filters: [],
        sort: null,
    })

    const [suggestions, setSuggestions] = useState<Filter[]>(getAllSuggestions())

    // Was not intended to be set directly. The idea is to set the filters and the sort.
    // Then, the effect listening on state should update the search result list.
    // We need that little hoop because we need to filter the results in an async manner.
    const [searchResults, setSearchResults] = useState<SearchResult[]>([])

    useEffect(() => {
        const createListenerEventRef = app.vault.on('create', () => {
            setSuggestions(getAllSuggestions())
        })

        return () => {
            app.vault.offref(createListenerEventRef)
        }
    })

    useEffect(() => {
        const unfilteredSearchResults = generateResults()

        // Text filters need to be applied manually, they cannot be realized only with a Dataview page query.
        const textFilters = state.filters.filter(f => f.type === "text") as TextFilter[]
        const maskPromise = unfilteredSearchResults.map((p) => applyTextFilters(p.path, textFilters))

        Promise.all(maskPromise).then((mask) => {
            setSearchResults(unfilteredSearchResults.filter((v, i) => mask[i]))
        })
    }, [state])

    function onSortChange(sortOption: MaybeSortOption) {
        setState(produce(state, draft => {
            draft.sort = sortOption
        }))
    }

    function onAddFilter(filter: Filter) {
        if (!state.filters.some(f => filterEqual(filter, f))) {
            const newState = {
                ...state,
                filters: [...state.filters, filter],
            }

            setState(newState)
        }
    }

    function onSetFilters(filters: Filter[]) {
        const newState = {
            ...state,
            filters: filters
        }

        setState(newState)
    }

    function onRemoveFilter(index: number) {
        const newFilterList = state.filters.slice()
        newFilterList.splice(index, 1)

        const newState = {
            ...state,
            filters: newFilterList,
        }

        setState(newState)
    }

    function reverseFilter(filter: Filter) {
        const newFilters = state.filters.slice()

        const filterIndex = state.filters.indexOf(filter)
        newFilters[filterIndex] = {
            ...filter,
            reversed: !filter.reversed
        }

        setState({
            ...state,
            filters: newFilters
        })
    }

    function generateResults(): SearchResult[] {
        const dv = getDataviewAPI(app)
        const dataviewQuery = filtersToDataviewQuery(state.filters.filter(f => f.type != "text"))

        const sorters: { [key: string]: (a: SearchResult, b: SearchResult) => number } = {
            "modified_date": (a: SearchResult, b: SearchResult) => a.mtime.toMillis() - b.mtime.toMillis(),
            "name": (a: SearchResult, b: SearchResult) => a.title.localeCompare(b.title),
            "size": (a: SearchResult, b: SearchResult) => a.size - b.size,
            "backlinks": (a: SearchResult, b: SearchResult) => a.backlinks - b.backlinks,
        }

        const sortFunction = state.sort ? sorters[state.sort.type] : sorters["modified_date"]
        const reversedSortFunction = state.sort && state.sort.reverse ? (a: SearchResult, b: SearchResult) => sortFunction(b, a) : sortFunction

        const pages: { file: DataviewFile }[] = dv.pages(dataviewQuery).values

        const results = pages.map((p: any) => {
            return dataviewFileToSearchResult(p.file)
        }).sort(reversedSortFunction)

        return results
    }

    async function applyTextFilters(path: string, filters: TextFilter[]): Promise<boolean> {
        const fileHandle = app.vault.getAbstractFileByPath(path)

        if (fileHandle instanceof TFile) {
            const fileContent = await app.vault.cachedRead(fileHandle)

            for (const f of filters) {
                if (f.reversed == fileContent.contains(f.value)) {
                    // If reversed is equal to contains, then the file does not match the filter.
                    return false
                }
            }

            return true
        }

        throw new Error("unexpected type when reading file")
    }

    return <div className="desk__root">
        <div className='desk__search-menu'>
            <FilterMenu
                filters={state.filters}
                suggestions={suggestions}
                sort={state.sort}
                onSortChange={(sortOption) => onSortChange(sortOption)}
                addFilter={(f) => { onAddFilter(f) }}
                removeFilter={(i: number) => { onRemoveFilter(i) }}
                reverseFilter={(f) => { reverseFilter(f) }} />
        </div>
        <ResultsDisplay
            results={searchResults}
            addFilter={(f) => { onAddFilter(f) }}
            setFilters={(f) => { onSetFilters(f) }} />
    </div>
}