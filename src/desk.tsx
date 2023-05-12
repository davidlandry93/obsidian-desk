import * as React from 'react'
import { produce } from 'immer'
import { getDataviewAPI } from './dataview'


import { FilterMenu as FilterMenu } from './autocomplete'
import { BacklinkFilter, Filter, FolderFilter, LinkFilter, filtersToDataviewQuery } from './filter'
import { ResultsDisplay } from './results'
import { SearchResult, dataviewFileToSearchResult } from './domain/searchresult'
import { MaybeSortOption } from './sortchip'
import { ExtendedMetadataCache } from 'src/obsidianprivate'
import { getMetadataCache } from './obsidian'


interface DeskViewState {
    suggestions: Filter[]
    filters: Filter[]
    sort: MaybeSortOption
}

export default class DeskComponent extends React.Component {
    state: DeskViewState

    constructor(props: never) {
        super(props)

        this.state = {
            filters: [],
            sort: null,
            suggestions: this.getAllSuggestions()
        }
    }

    getAllSuggestions(): Filter[] {
        const suggestions = [
            ...this.getTagSuggestions(), 
            ...this.getLinkSuggestions(), 
            ...this.getFolderSuggestions(), 
            ...this.getBacklinkSuggestions()
        ]
        return suggestions.sort((a, b) => a.value.length - b.value.length)
    }

    getTagSuggestions(): Filter[] {
        const metadataCache = getMetadataCache(app)
        return Object.keys(metadataCache.getTags()).map((t) => {return {type: "tag", value: t, key: t}})
    }

    getFolderSuggestions(): FolderFilter[] {
        const folderPaths = app.vault.getAllLoadedFiles().filter(f => ('children' in f) && f.path !== '/').map(f => f.path)
        return folderPaths.map((p) => {
            return {
                type: 'folder',
                value: p,
                key: p,
            }
        })
    }

    getLinkSuggestions(): LinkFilter[] {
        const metadataCache = app.metadataCache as ExtendedMetadataCache

        return metadataCache.getLinkSuggestions().map((s: any) =>{
            const filter: LinkFilter = {type: "link", value: s.path, exists: s.file !== null}

            if ('alias' in s) {
                filter.alias = s.alias
            }

            return filter
        })
    }

    getBacklinkSuggestions(): BacklinkFilter[] {
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

    onQueryChange(filters: Filter[]) {
        const newState = produce(this.state, draft => {
            draft.filters = filters
        })

        this.setState(newState)
    }

    onSortChange(sortOption: MaybeSortOption) {
        this.setState(produce(this.state, draft => {
            draft.sort = sortOption
        }))
    }

    onAddFilter(filter: Filter) {
        const newState: DeskViewState = {
            ...this.state, 
            filters: [...this.state.filters, filter],
        }

        this.setState(newState)
    }

    onRemoveFilter(index: number) {
        console.log("On Remove Filter")
        const newFilterList = this.state.filters.slice().splice(index, 1)

        const newState = {
            ...this.state,
            filter: newFilterList
        }

        this.setState(newState)
    }

    generateResults(): SearchResult[] {
        const dv = getDataviewAPI(app)
        const dataviewQuery = filtersToDataviewQuery(this.state.filters)

        const sorters: { [key: string]: (a: SearchResult, b: SearchResult) => number} = {
            "modified_date": (a: SearchResult, b: SearchResult) => a.mtime.toMillis() - b.mtime.toMillis(),
            "name": (a: SearchResult, b: SearchResult) => a.title.localeCompare(b.title),
            "size": (a: SearchResult, b: SearchResult) => a.size - b.size,
            "backlinks": (a: SearchResult, b: SearchResult) => a.backlinks - b.backlinks,
        }

        const sortFunction = this.state.sort ? sorters[this.state.sort.type] : sorters["modified_date"]

        const pages = dv.pages(dataviewQuery).values
        return pages.map((p: any) =>{
                return dataviewFileToSearchResult(p.file)
            }).sort(sortFunction)
    }

    render() {
        console.log("Generating search results")
        const searchResults = this.generateResults()
        console.log("Done fetching search results")

        return <div className="desk__root">
            <div className='desk__search-menu'>
                <div className='desk__text-search-input-container'>
                    <input type="text" placeholder='Search text' />
                </div>
                <FilterMenu 
                    filters={this.state.filters}
                    suggestions={this.state.suggestions}
                    onSortChange={(sortOption) => this.onSortChange(sortOption)}
                    addFilter={(f) => { this.onAddFilter(f)}}
                    removeFilter={(i: number) => { this.onRemoveFilter(i) }} />
            </div>
            <ResultsDisplay 
                results={searchResults} 
                addFilter={(f) => { this.onAddFilter(f)}} />
        </div>
    }
}