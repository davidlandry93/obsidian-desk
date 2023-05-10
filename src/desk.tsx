import * as React from 'react'
import { produce } from 'immer'


import { AutocompleteSearchBox as FilterMenu } from './autocomplete'
import { Filter, filtersToDataviewQuery } from './filter'
import { ResultsDisplay, SearchResult } from './results'






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
            results: app.vault.getMarkdownFiles().map((t) => {
                return {
                key: t.path,
                title: t.basename,
                path: t.path,
                body: ""
            }}),
            filters: [],
            suggestions: this.getAllSuggestions()
        }
    }

    getAllSuggestions(): Filter[] {
        return [...this.getTagSuggestions(), ...this.getLinkSuggestions(), ...this.getFolderSuggestions(), ...this.getBacklinkSuggestions()]
    }

    getTagSuggestions(): Filter[] {
        return Object.keys(app.metadataCache.getTags()).map((t) => {return {type: "tag", value: t, key: t}})
    }

    getFolderSuggestions(): Filter[] {
        const folderPaths = app.vault.getAllLoadedFiles().filter(f => ('children' in f) && f.path !== '/').map(f => f.path)
        return folderPaths.map((p) => {
            return {
                type: 'folder',
                value: p,
                key: p,
            }
        })
    }

    getLinkSuggestions(): Filter[] {
        return app.metadataCache.getLinkSuggestions().map((s) =>{ return {type: "link", value: s.path, key: s.path}})
    }

    getBacklinkSuggestions(): Filter[] {
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

        const pages = dv.pages(dataviewQuery)

        const newState = produce(this.state, draft => {
            draft.results = pages.map((p: any) => {
                return {
                    title: p.file.name,
                    key: p.file.path,
                    path: p.file.path,
                    body: "",
                }
            })
        })
        this.setState(newState)
    }

    render() {
        return <div>
            <h1>Desk</h1>
            <h2>Search</h2>
            <div className='desk__search-menu'>
                <div className='desk__text-search-input-container'>
                    <input type="text" placeholder='Search text' />
                </div>
                <FilterMenu suggestions={this.state.suggestions} onChange={(newFilters) => this.onQueryChange(newFilters)} />
            </div>
            <h2>Results</h2>
            <ResultsDisplay results={this.state.results}></ResultsDisplay>
        </div>
    }


}