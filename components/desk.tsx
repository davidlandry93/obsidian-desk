import { Vault } from 'obsidian'
import * as React from 'react'

interface DeskQueryFilter {
    type: string
    value: string
}

interface SearchResult {
  title: string
  key: string
}

interface ResultsDisplayProps {
  results: SearchResult[]
}

function FilterSelector(props: FilterSelectorProps) {
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
}

interface DeskViewState {
    results: SearchResult[]
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
            }})
        }
    }

    render() {
        return <div>
            <h1>Desk</h1>
            <h2>Search</h2> 
            <h2>Filters</h2>
            <FilterSelector/>
            <h2>Results</h2>
            <ResultsDisplay results={this.state.results}></ResultsDisplay>
        </div>
    }
}