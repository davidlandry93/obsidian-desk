import React from 'react'

import { NoteCard } from './notecard'


export interface SearchResult {
    title: string
    key: string
    body: string
    path: string
  }
  

interface SearchResultsProps {
    results: SearchResult[]
  }

export function ResultsDisplay(props: SearchResultsProps) {
    const resultItems = props.results.map(r => <div className='desk__search-result'>
        <NoteCard title={r.title} path={r.path} key={r.key} />
    </div>)

    return <div className='desk__search-result-container'>
        {resultItems}   
    </div>
}
