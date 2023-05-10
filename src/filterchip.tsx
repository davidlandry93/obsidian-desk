import React, { MouseEventHandler } from 'react'
import {Filter, keyOfFilter} from './filter'
import { Folder, Link, CaseLower, X, Tag } from 'lucide-react'

interface FilterChipProps {
    filter: Filter,
    onClick?: MouseEventHandler,
    closeable?: boolean
}

const iconOfType = {
    'folder': Folder,
    'link': Link,
    'tag': Tag,
    'text': CaseLower
}

export function FilterChip(props: FilterChipProps) {
    const IconType = iconOfType[props.filter.type]

    return <span className="desk__chip" onClick={props.onClick} key={keyOfFilter(props.filter)}>
            <IconType className="desk__chip-icon"/>
            <a>{props.filter.value}</a>
            {props.closeable ? <X className="desk__chip-icon desk__chip-delete-icon" /> : null}
        </span>
}