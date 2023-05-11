import React, {useState} from 'react'
import { ArrowDown } from 'lucide-react'

interface SortChipProps {
    onChange: (sortString: string) => void
}

const sortOptions = [
    {label: "Date Modified (New to old)", dataviewString: ""},
    {label: "Date Modified (Old to new)", dataviewString: ""},
]

export function SortChip(props: SortChipProps) {
    const [showDropdown, setShowDropdown] = useState(false)

    function onClick() {
        setShowDropdown(!showDropdown)
    }

    const sortOptionsButtons = sortOptions.map((so) => {
        return <li className='desk__dropdown-list-item'><a>{so.label}</a></li>
    })

    const dropdown = <div className='desk__dropdown'>
        <ul className='desk__dropdown-list'>
            {sortOptionsButtons}
        </ul>
    </div>

    return <div className='desk__sort-chip-container'>
            <span className="desk__chip" onClick={() => onClick()}>
            Sort by...
            <ArrowDown />
        </span>
        { showDropdown ? dropdown : null }
    </div>
}