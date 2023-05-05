import * as React from 'react'
import { produce } from 'immer'


import { AutocompleteSearchBox } from './autocomplete'
import { Filter, filtersToDataviewQuery } from './filter'
import { NoteCard } from './notecard'

interface SearchResult {
  title: string
  key: string
  body: string
  path: string
}

interface SearchResultsProps {
  results: SearchResult[]
}


function ResultsDisplay(props: SearchResultsProps) {
    const resultItems = props.results.map(r => <div className='desk__search-result'>
        <NoteCard title={r.title} path={r.path} key={r.key} />
    </div>)

    return <div className='desk__search-result-container'>
        {resultItems}   
    </div>
}


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
        return [...this.getTagSuggestions(), ...this.getLinkSuggestions(), ...this.getFolderSuggestions()]
    }

    getTagSuggestions(): Filter[] {
        return Object.keys(app.metadataCache.getTags()).map((t) => {return {type: "tag", value: t, key: t}})
    }

    getFolderSuggestions(): Filter[] {
        const folderPaths = app.vault.getAllLoadedFiles().filter(f => 'children' in f).map(f => f.path)
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

    render() {
        return <div>
            <h1>Desk</h1>
            <h2>Search</h2>
            <AutocompleteSearchBox suggestions={this.state.suggestions} onChange={(newFilters) => this.onQueryChange(newFilters)} />
            <h2>Results</h2>
            <ResultsDisplay results={this.state.results}></ResultsDisplay>
        </div>
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
}