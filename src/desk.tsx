import * as React from 'react'


import { ExtendedMetadataCache } from 'ExtendedObsidian'
import { Vault } from 'obsidian'
import { AutocompleteSearchBox } from './autocomplete'
import { Filter, filtersToDataviewQuery } from './filter'
import { produce } from 'immer'

interface SearchResult {
  title: string
  key: string
}

interface ResultsDisplayProps {
  results: SearchResult[]
}

function ResultsDisplay(props: ResultsDisplayProps) {
    const resultItems = props.results.map(r => <div className='desk__search-result'>
        <div className='desk__search-result-title'>
            {r.title}
        </div>
    </div>)

    return <div className='desk__search-result-container'>
        {resultItems}   
    </div>
}


interface DeskViewProps {
  vault: Vault
  metadataCache: ExtendedMetadataCache
}

interface DeskViewState {
    results: SearchResult[]
    suggestions: Filter[]
    filters: Filter[]
}

export default class DeskComponent extends React.Component<DeskViewProps> {
    state: DeskViewState

    constructor(props: DeskViewProps) {
        super(props)

        this.state = {
            results: this.props.vault.getMarkdownFiles().map((t) => {
                return {
                key: t.path,
                title: t.basename
            }}),
            filters: [],
            suggestions: this.getAllSuggestions()
        }
    }

    getAllSuggestions(): Filter[] {
        return [...this.getTagSuggestions(), ...this.getLinkSuggestions()]
    }

    getTagSuggestions(): Filter[] {
        return Object.keys(this.props.metadataCache.getTags()).map((t) => {return {type: "tag", value: t}})
    }

    getLinkSuggestions(): Filter[] {
        return this.props.metadataCache.getLinkSuggestions().map((s) =>{ return {type: "link", value: s.path}})
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
        console.log(pages)

        const newState = produce(this.state, draft => {
            draft.results = pages.map((p: any) => {
                return {
                    title: p.file.name,
                    key: p.file.path
                }
            })
        })
        this.setState(newState)
    }
}