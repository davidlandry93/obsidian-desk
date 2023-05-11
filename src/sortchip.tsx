import React, {MouseEvent, useEffect, useRef, useState} from 'react'
import { ChevronDown, X } from 'lucide-react'

interface SortChipProps {
    onChange: (sortOption: MaybeSortOption) => void
}

interface SortOption {
    label: string,
    type: "modified_date" | "name",
}

export type MaybeSortOption = SortOption | null

const sortOptions: SortOption[] = [
    {label: "Date Modified", type: "modified_date"},
    {label: "Name", type: "name"}
]

export function SortChip(props: SortChipProps) {
    const [sortOption, setSortOption] = useState<MaybeSortOption>(null)
    const [showDropdown, setShowDropdown] = useState(false)
    const dropdownRef = useRef(null)

    useEffect(() => {
        const handler = (ev: MouseEvent) => {
            console.log("Got click")
            if (dropdownRef.current) {
                if(showDropdown && !dropdownRef.current.contains(ev.target)) {
                    console.log("Removing dropdown")

                    setShowDropdown(false)
                }
            }
        }

        window.addEventListener("click", handler)

        return () => {window.removeEventListener('click', handler)}

    }, [showDropdown])

    useEffect(() => {
        props.onChange(sortOption)
    }, [sortOption])

    function onClick(e: MouseEvent) {
        e.stopPropagation()
        setShowDropdown(!showDropdown)
    }

    function optionClicked(sortOption: SortOption) {
        setSortOption(sortOption)
        setShowDropdown(false)
    }

    const sortOptionsButtons = sortOptions.map((so) => {
        return <li 
            className='desk__dropdown-list-item'
            key={so.label} 
            onClick={() => {optionClicked(so)}}>
                <a>{so.label}</a>
        </li>
    })

    const dropdown = <div className='desk__dropdown' ref={dropdownRef}>
        <ul className='desk__dropdown-list'>
            {sortOptionsButtons}
        </ul>
    </div>

    return <div className='desk__sort-chip-container'>
            <span className="desk__chip" onClick={(e) => {onClick(e)}}>
            { sortOption === null ? "Sort by..." : sortOption.label }
            <ChevronDown />
            { sortOption === null ? null : <X onClick={() => {setSortOption(null)}} />}
        </span>
        { showDropdown ? dropdown : null }
    </div>
}