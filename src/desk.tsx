import React, {useState, useEffect} from 'react'
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


interface DeskComponentState {
    suggestions: Filter[]
    filters: Filter[]
    sort: MaybeSortOption

    results: SearchResult[]
}

function getTagSuggestions(): Filter[] {
    const metadataCache = getMetadataCache(app)
    return Object.keys(metadataCache.getTags()).map((t) => {return {type: "tag", value: t, key: t, reversed: false}})
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

    return metadataCache.getLinkSuggestions().map((s: any) =>{
        const filter: LinkFilter = {type: "link", value: s.path, exists: s.file !== null, reversed: false}

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


export function DeskComponent() {
    const [state, setState] = useState<DeskComponentState>({
        filters: [],
        sort: null,
        suggestions: getAllSuggestions(),
        results: []
    })

    useEffect(() => {
        const createListenerEventRef = app.vault.on('create', () => {
            setState({
                ...state,
                suggestions: getAllSuggestions()
            })
        })

        return () => {
            app.vault.offref(createListenerEventRef)
        }
    })

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
        console.log("On Remove Filter")
        const newFilterList = state.filters.slice()
        newFilterList.splice(index, 1)

        console.log("From", state.filters, "to", newFilterList)

        const newState = {
            ...state,
            filters: newFilterList,
        }

        console.log(newState)

        setState(newState)
    }

    function reverseFilter(filter: Filter) {
        const newFilters = state.filters.slice()

        const filterIndex = state.filters.indexOf(filter)
        newFilters[filterIndex]= {
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
        const dataviewQuery = filtersToDataviewQuery(state.filters)

        const sorters: { [key: string]: (a: SearchResult, b: SearchResult) => number} = {
            "modified_date": (a: SearchResult, b: SearchResult) => a.mtime.toMillis() - b.mtime.toMillis(),
            "name": (a: SearchResult, b: SearchResult) => a.title.localeCompare(b.title),
            "size": (a: SearchResult, b: SearchResult) => a.size - b.size,
            "backlinks": (a: SearchResult, b: SearchResult) => a.backlinks - b.backlinks,
        }

        const sortFunction = state.sort ? sorters[state.sort.type] : sorters["modified_date"]
        const reversedSortFunction = state.sort && state.sort.reverse ? (a: SearchResult, b: SearchResult) => sortFunction(b, a) : sortFunction

        const pages: {file: DataviewFile}[] = dv.pages(dataviewQuery).values

        // Text filters need to be applied manually, they cannot be realized only with a Dataview page query.
        const textFilters = state.filters.filter(f => f.type === "text") as TextFilter[]
        const pagesTextFiltered = pages.filter((p) => applyTextFilters(p.file, textFilters))

        const results = pagesTextFiltered.map((p: any) =>{
            return dataviewFileToSearchResult(p.file)
        }).sort(reversedSortFunction)

        return results
    }

    async function applyTextFilters(page: DataviewFile, filters: TextFilter[]): Promise<boolean> {
        const fileHandle = app.vault.getAbstractFileByPath(page.path)

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


    const searchResults = generateResults()

    return <div className="desk__root">
        <div className='desk__search-menu'>
            <div className='desk__text-search-input-container'>
                <input type="text" placeholder='Search text' />
            </div>
            <FilterMenu 
                filters={state.filters}
                suggestions={state.suggestions}
                sort={state.sort}
                onSortChange={(sortOption) => onSortChange(sortOption)}
                addFilter={(f) => { onAddFilter(f)}}
                removeFilter={(i: number) => { onRemoveFilter(i) }}
                reverseFilter={(f) => { reverseFilter(f) }} />
        </div>
        <ResultsDisplay 
            results={searchResults} 
            addFilter={(f) => { onAddFilter(f)}}
            setFilters={(f) => { onSetFilters(f) }} />
    </div>
}