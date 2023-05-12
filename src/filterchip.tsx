import React, { MouseEvent, MouseEventHandler } from 'react'
import {Filter, keyOfFilter} from './filter'
import { Folder, CaseLower, X, Tag, FileInput, FileOutput } from 'lucide-react'

interface FilterChipProps {
    filter: Filter,
    onClick?: MouseEventHandler,
    closeable?: boolean
    onClose?: (filter: Filter) => void
}

const iconOfType = {
    'folder': Folder,
    'link': FileInput,
    'tag': Tag,
    'text': CaseLower,
    'backlink': FileOutput,
}

export function FilterChip(props: FilterChipProps) {
    const IconType = iconOfType[props.filter.type]

    const onCloseClicked = (e: MouseEvent) => {
        if (props.onClose !== undefined) {
            e.stopPropagation()
            props.onClose(props.filter)
        }
    }

    const closeButton = <span onClick={onCloseClicked}>
        <X className="desk__chip-icon desk__chip-delete-icon" />
    </span>

    return <span 
        className={`desk__chip${props.filter.reversed ? ' reversed' : ''}`}
        onClick={(e) => props.onClick !== undefined ? props.onClick(e) : null} 
        key={keyOfFilter(props.filter)}>
            <IconType className="desk__chip-icon"/>
            {props.filter.value}
            {props.closeable ?  closeButton : null}
        </span>
}