import React, { useContext, useState, useEffect, useRef } from 'react'

import { ObsidianContext } from './obsidiancontext'
import { App, TFile, MarkdownRenderer } from 'obsidian'
import { Clock, FileInput, Folder } from 'lucide-react'
import { DateTime } from 'luxon'

import { Filter } from './filter'

function navigateToNote(path: string, app: App) {
    const note = app.vault.getAbstractFileByPath(path)
    if (note !== null && note instanceof TFile) {
        app.workspace.getLeaf('tab').openFile(note)
    }
}


interface NoteCardProps {
    path: string,
    title: string,
    folder: string,
    backlinks: number,
    date: DateTime
    setFilters: (filters: Filter[]) => void
}


export function NoteCard(props: NoteCardProps) {
    const app = useContext(ObsidianContext) as App
    const [body, setBody] = useState("")
    const contentRef = useRef<HTMLDivElement>(null)
    const [expanded, setExpanded] = useState(false)
    const [overflowing, setOverflowing] = useState(false)


    useEffect(() => {
        const container = contentRef.current

        if (container !== null) {
            MarkdownRenderer.render(
                app, body, container, props.path, null
            ).then(() => {
                checkOverflow(container)
            })
        } else {
            throw new Error("Own container not found")
        }
    }, [body])


    function checkOverflow(container: HTMLDivElement) {
        if (container.scrollHeight > container.clientHeight) {
            setOverflowing(true)
        } else {
            setOverflowing(false)
        }
    }

    useEffect(() => {
        if (file instanceof TFile) {
            const fileContents = app.vault.cachedRead(file)
            fileContents.then(setBody)
        } else {
            setBody('Error')
        }
    }, [])

    // Monitor modifications on that file.
    useEffect(() => {
        const callbackRef = app.vault.on("modify", (file) => {
            if (file.path === props.path) {
                if (file instanceof TFile) {
                    app.vault.cachedRead(file).then(setBody)
                }
            }
        })

        return () => {
            app.vault.offref(callbackRef)
        }
    })

    function onClick() {
        setExpanded(!expanded)
    }

    const file = app.vault.getAbstractFileByPath(props.path)
    const backlinkString = props.backlinks === 1 ? 'backlink' : 'backlinks'
    const overflowingClass = overflowing && !expanded ? 'overflowing' : ''
    const expandedClass = expanded ? 'expanded' : ''
    const contentStyle = expanded && contentRef.current ? { maxHeight: contentRef.current.scrollHeight } : {}

    return <div className='desk__note-card' onClick={() => { onClick() }}>
        <div className='desk__note-card-header'>
            <a onClick={() => { navigateToNote(props.path, app) }}><h3>{props.title}</h3></a>
        </div>
        <div className={`desk__search-result-content ${overflowingClass} ${expandedClass}`} ref={contentRef} style={contentStyle}></div>
        <div className='desk__note-card-footer'>
            {props.folder === '' ? null : <span><Folder className="desk__note-card-header-details-icon" /><a onClick={() => { props.setFilters([{ type: "folder", reversed: false, value: props.folder }]) }}>{props.folder}</a></span>}
            <span><FileInput className="desk__note-card-header-details-icon" /><a onClick={() => { props.setFilters([{ type: "link", reversed: false, value: props.path, exists: true }]) }}>{`${props.backlinks} ${backlinkString}`}</a></span>
            <span><Clock className="desk__note-card-header-details-icon" />Modified on {props.date.toLocaleString(DateTime.DATE_SHORT)}</span>
        </div>
    </div>
}