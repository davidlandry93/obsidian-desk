import * as React from 'react'
import { produce } from 'immer'
import { getDataviewAPI } from './dataview'


import { FilterMenu as FilterMenu } from './filtermenu'
import { BasicFilter, Filter, LinkFilter, filterEqual, filtersToDataviewQuery } from './filter'
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
        return Object.keys(metadataCache.getTags()).map((t) => {return {type: "tag", value: t, key: t, reversed: false}})
    }

    getFolderSuggestions(): BasicFilter[] {
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

    getLinkSuggestions(): LinkFilter[] {
        const metadataCache = app.metadataCache as ExtendedMetadataCache

        return metadataCache.getLinkSuggestions().map((s: any) =>{
            const filter: LinkFilter = {type: "link", value: s.path, exists: s.file !== null, reversed: false}

            if ('alias' in s) {
                filter.alias = s.alias
            }

            return filter
        })
    }

    getBacklinkSuggestions(): BasicFilter[] {
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

    onSortChange(sortOption: MaybeSortOption) {
        this.setState(produce(this.state, draft => {
            draft.sort = sortOption
        }))
    }

    onAddFilter(filter: Filter) {
        if (!this.state.filters.some(f => filterEqual(filter, f))) {
            const newState: DeskViewState = {
                ...this.state, 
                filters: [...this.state.filters, filter],
            }
    
            this.setState(newState)
        }
    }

    onSetFilters(filters: Filter[]) {
        const newState: DeskViewState = {
            ...this.state,
            filters: filters
        }

        this.setState(newState)
    }

    onRemoveFilter(index: number) {
        console.log("On Remove Filter")
        const newFilterList = this.state.filters.slice()
        newFilterList.splice(index, 1)

        console.log("From", this.state.filters, "to", newFilterList)

        const newState = {
            ...this.state,
            filters: newFilterList,
        }

        console.log(newState)

        this.setState(newState)
    }

    reverseFilter(filter: Filter) {
        const newFilters = this.state.filters.slice()

        const filterIndex = this.state.filters.indexOf(filter)
        newFilters[filterIndex]= {
            ...filter,
            reversed: !filter.reversed
        }

        this.setState({
            ...this.state,
            filters: newFilters
        })
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
        const reversedSortFunction = this.state.sort && this.state.sort.reverse ? (a: SearchResult, b: SearchResult) => sortFunction(b, a) : sortFunction

        const pages = dv.pages(dataviewQuery).values
        return pages.map((p: any) =>{
                return dataviewFileToSearchResult(p.file)
            }).sort(reversedSortFunction)
    }

    render() {
        const searchResults = this.generateResults()

        return <div className="desk__root">
            <div className='desk__search-menu'>
                <div className='desk__text-search-input-container'>
                    <input type="text" placeholder='Search text' />
                </div>
                <FilterMenu 
                    filters={this.state.filters}
                    suggestions={this.state.suggestions}
                    sort={this.state.sort}
                    onSortChange={(sortOption) => this.onSortChange(sortOption)}
                    addFilter={(f) => { this.onAddFilter(f)}}
                    removeFilter={(i: number) => { this.onRemoveFilter(i) }}
                    reverseFilter={(f) => { this.reverseFilter(f) }} />
            </div>
            <ResultsDisplay 
                results={searchResults} 
                addFilter={(f) => { this.onAddFilter(f)}}
                setFilters={(f) => { this.onSetFilters(f) }} />
        </div>
    }
}