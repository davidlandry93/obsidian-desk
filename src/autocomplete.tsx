import React, { ChangeEvent, useEffect, useRef } from 'react'
import { useState } from 'react'
import { produce } from 'immer'
import { Filter, keyOfFilter } from './filter'
import { FilterChip } from './filterchip'
import { ListFilter } from 'lucide-react'

interface AutocompleteProps {
    suggestions: Filter[]
    onChange: (newFilters: Filter[]) => void
}

export function AutocompleteSearchBox(props: AutocompleteProps) {
    const [userInput, setUserInput] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [filteredSuggestions, setFilteredSuggestions] = useState(props.suggestions)
    const [selectedSuggestion, setSelectedSuggestion] = useState(0)
    const [filters, setFilters] = useState<Filter[]>([])
    const textInputRef = useRef<HTMLInputElement>(null)

    function onTextChange(e: ChangeEvent<HTMLInputElement>) {
        setUserInput(e.target.value)
        setShowSuggestions(true)
        setFilteredSuggestions(
            props.suggestions.filter(s => s.value.contains(e.target.value) && !filters.contains(s))
        )
    }

    function addSuggestion(f: Filter) {
        setFilters(produce(filters, draft => {
            draft.push(f)
        }))

        setUserInput('')
        setShowSuggestions(false)

        if(textInputRef.current) {
            textInputRef.current.focus()
        }
    }

    function selectSuggestion(index: number) {
        setSelectedSuggestion(index)
    }

    function removeChip(index: number) {
        setFilters(produce(filters, draft => {
            draft.splice(index, 1)
        }))
    }

    const onKeyDown = (e: KeyboardEvent) => {
        if(userInput.length === 0 && e.key === "Backspace" && e.target === textInputRef.current) {
            setFilters(produce(filters, draft => {
                draft.pop()
            }))
        }

        if(e.key === "Enter" && e.target === textInputRef.current) {
            addSuggestion(filteredSuggestions[selectedSuggestion])
        }

        return false
    }

    useEffect(() => {
        props.onChange(filters)
    }, [filters])

    useEffect(() => {
        if (textInputRef.current) {
            textInputRef.current.addEventListener('keydown', onKeyDown)
        }
        
        return () => { 
            if(textInputRef.current) {
                textInputRef.current.removeEventListener('keydown',onKeyDown) 
            }
        }
    }, [userInput, filters])

    function suggestionDescription(filter: Filter) {
        if (filter.type === "tag") {
            return <span>Has tag <FilterChip filter={filter} closeable={false} /></span>;
        } else if (filter.type === "folder") {
            return <span>Is inside folder <FilterChip filter={filter} closeable={false} /></span>;
        } else if (filter.type === "link") {
            return <span>Links to <FilterChip filter={filter} closeable={false} /></span>;
        } else {
            throw new Error("Unknown filter type when generating description text.")
        }
    }

    const suggestionComponents = filteredSuggestions.map((suggestion, index) => { 
        return <li key={keyOfFilter(suggestion)} className={`desk__suggestions-list-item`}>
            <a 
            className={`${index === selectedSuggestion ? 'selected' : ''}`}
            onClick={() => {addSuggestion(suggestion)}}
            onMouseEnter={() => {selectSuggestion(index)}}
            >{suggestionDescription(suggestion)}</a>
        </li>
    })

    const chips = filters.map((f, i) =>{
        return <FilterChip filter={f} onClick={() => removeChip(i)} key={keyOfFilter(f)} closeable={true} />
    })

    return (
        <div className='desk__filter-menu'>
            <ListFilter className='list-filter-icon' />
            <div className={`desk__autocomplete-search-box-container`}>
                {chips}
                <div className='desk__filter-search-container'>
                    <input 
                        className='desk__search-box-container-input' 
                        type="text" 
                        value={userInput} 
                        onChange={onTextChange}
                        placeholder='Filter by tag, link...'
                        ref={textInputRef} ></input>
                    { showSuggestions ? <div className='desk__autocomplete-suggestions'><ul className="desk__suggestions-list">{suggestionComponents}</ul></div> : null}
                </div>
            </div>
        </div>
    )
}