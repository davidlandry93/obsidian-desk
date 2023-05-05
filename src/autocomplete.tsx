import React, { ChangeEvent, useEffect } from 'react'
import { useState } from 'react'
import { produce } from 'immer'
import { Filter } from './filter'

interface AutocompleteProps {
    suggestions: Filter[]
    onChange: (newFilters: Filter[]) => void
}

function keyOfFilter(f: Filter) {
    return f.value
}

export function AutocompleteSearchBox(props: AutocompleteProps) {
    const [userInput, setUserInput] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [filteredSuggestions, setFilteredSuggestions] = useState(props.suggestions)
    const [selectedSuggestion, setSelectedSuggestion] = useState(0)
    const [filters, setFilters] = useState<Filter[]>([])

    function onTextChange(e: ChangeEvent<HTMLInputElement>) {
        setUserInput(e.target.value)
        setShowSuggestions(true)
        setFilteredSuggestions(
            props.suggestions.filter(s => s.value.contains(e.target.value) && !filters.contains(s))
        )
    }

    function onSuggestionClick(f: Filter) {
        setFilters(produce(filters, draft => {
            draft.push(f)
        }))

        setUserInput('')
        setShowSuggestions(false)
    }

    function removeChip(index: number) {
        setFilters(produce(filters, draft => {
            draft.splice(index, 1)
        }))
    }

    useEffect(() => {
        props.onChange(filters)
    }, [filters])

    const suggestionComponents = filteredSuggestions.map((s, index) => { 
        return <li key={keyOfFilter(s)}>
            <a 
            className={`desk__suggestion-item ${index === selectedSuggestion ? 'desk__suggestion-item-selected' : ''}`}
            onClick={() => {onSuggestionClick(s)}}
            >{s.value}</a>
        </li>
    })

    const chips = filters.map((f, i) =>{
        return <span className="desk__chip" onClick={() => {removeChip(i)}} key={keyOfFilter(f)}>{f.value}</span>
    })

    return (
        <div className='desk__autocomplete-search-box-container'>
            <div className='desk__autocomplete-search-box-combo'>
                <div className='desk__search-box-chip-container'>{chips}</div>
                <input className='desk__search-box-container-input' type="text" value={userInput} onChange={onTextChange}></input>
            </div>
            { showSuggestions ? <div className='desk__autocomplete-suggestions'><ul>{suggestionComponents}</ul></div> : null}
        </div>
    )
}