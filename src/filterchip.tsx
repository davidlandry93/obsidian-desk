import React, { MouseEventHandler } from 'react'
import {Filter, keyOfFilter} from './filter'
import { Folder, Link, Hash, CaseLower } from 'lucide-react'

interface FilterChipProps {
    filter: Filter,
    onClick: MouseEventHandler
}

const iconOfType = {
    'folder': Folder,
    'link': Link,
    'tag': Hash,
    'text': CaseLower
}

export function FilterChip(props: FilterChipProps) {
    const IconType = iconOfType[props.filter.type]

    return <span className="desk__chip" onClick={props.onClick} key={keyOfFilter(props.filter)}>
        <IconType />
        {props.filter.value}
        </span>
}