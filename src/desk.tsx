import * as React from 'react'
import { produce } from 'immer'


import { AutocompleteSearchBox as FilterMenu } from './autocomplete'
import { BacklinkFilter, Filter, FolderFilter, LinkFilter, filtersToDataviewQuery } from './filter'
import { ResultsDisplay } from './results'
import { SearchResult, dataviewFileToSearchResult } from './domain/searchresult'
import { MaybeSortOption } from './sortchip'


interface DeskViewState {
    results: SearchResult[]
    suggestions: Filter[]
    filters: Filter[]
}

export default class DeskComponent extends React.Component {
    state: DeskViewState

    constructor(props: never) {
        super(props)

        this.state = {
            results: [],
            filters: [],
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
        return Object.keys(app.metadataCache.getTags()).map((t) => {return {type: "tag", value: t, key: t}})
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
        return app.metadataCache.getLinkSuggestions().map((s: any) =>{
            const filter: LinkFilter = {type: "link", value: s.path, exists: s.file !== null}

            if ('alias' in s) {
                filter.alias = s.alias
            }

            return filter
        })
    }

    getBacklinkSuggestions(): BacklinkFilter[] {
        const dv = app.plugins.getPlugin('dataview').api

        const allPages = dv.pages('""').values

        const withBacklinks = allPages.map(p => p.file).filter((p: any) => p.outlinks.length > 0).map((p: any) => {
            return {
                type: "backlink",
                value: p.path,
                key: p.path
            }
        })
        return withBacklinks
    }

    onQueryChange(filters: Filter[]) {
        const dv = app.plugins.plugins.dataview.api
        const dataviewQuery = filtersToDataviewQuery(filters)

        const pages = dv.pages(dataviewQuery).values
        const newState = produce(this.state, draft => {
            draft.results = pages.map((p: any) =>{
                return dataviewFileToSearchResult(p.file)
            })
        })

        this.setState(newState)
    }

    onSortChange(sortOption: MaybeSortOption) {
        const sorters: { [key: string]: (a: SearchResult, b: SearchResult) => number} = {
            "modified_date": (a: SearchResult, b: SearchResult) => a.mtime.toMillis() - b.mtime.toMillis(),
            "name": (a: SearchResult, b: SearchResult) => a.title.localeCompare(b.title),
            "size": (a: SearchResult, b: SearchResult) => a.size - b.size,
            "backlinks": (a: SearchResult, b: SearchResult) => a.backlinks - b.backlinks,
        }

        if (sortOption !== null) {
            const newResults = produce(this.state, draft => {
                const newArray = draft.results.slice()

                let sortFunction = sorters[sortOption.type]
                if(sortOption.reverse) {
                    sortFunction = (a, b) => sorters[sortOption.type](b, a)
                }
                newArray.sort(sortFunction)
                draft.results = newArray
            })

            this.setState(newResults)
        }
    }

    render() {
        return <div className="desk__root">
            <div className='desk__search-menu'>
                <div className='desk__text-search-input-container'>
                    <input type="text" placeholder='Search text' />
                </div>
                <FilterMenu 
                    suggestions={this.state.suggestions} 
                    onChange={(newFilters) => this.onQueryChange(newFilters)} 
                    onSortChange={(sortOption) => this.onSortChange(sortOption)} />
            </div>
            <ResultsDisplay results={this.state.results}></ResultsDisplay>
        </div>
    }


}