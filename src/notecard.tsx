import React, {useContext, useState, useEffect, useRef} from 'react'

import { ObsidianContext } from './obsidiancontext'
import { App, TFile, MarkdownRenderer } from 'obsidian'
import { Clock, FileInput, Folder } from 'lucide-react'
import { DateTime } from 'luxon'


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
}


export function NoteCard(props: NoteCardProps) {
    const app = useContext(ObsidianContext) as App
    const [body, setBody] = useState("")
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const container = ref.current

        if(container !== null) {
            MarkdownRenderer.renderMarkdown(body, container, props.path, null)
        } else {
            throw new Error("Own container not found")
        }
    }, [body])

    useEffect(() => {
        function onFetch(fileContents: string) {
            setBody(fileContents)
        }
    
        if (file instanceof TFile) {
            const fileContents = app.vault.cachedRead(file)
            fileContents.then(onFetch)
        } else {
            setBody('Error')
        }
    }, [])

    const file = app.vault.getAbstractFileByPath(props.path)
    const backlinkString = props.backlinks === 1 ? 'backlink' : 'backlinks'

    return <div className='desk__note-card'>
            <div className='desk__note-card-header'> 
                <a onClick={() => {navigateToNote(props.path, app)}}><h3>{props.title}</h3></a>
            </div>
            <div className='desk__search-result-content' ref={ref}></div>
            <div className='desk__note-card-footer'>
                { props.folder === '' ? null : <span><Folder className="desk__note-card-header-details-icon" />{props.folder}</span> }
                <span><FileInput className="desk__note-card-header-details-icon" />{`${props.backlinks} ${backlinkString}`}</span>
                <span><Clock className="desk__note-card-header-details-icon" />Modified on { props.date.toLocaleString(DateTime.DATE_SHORT) }</span>
            </div>
        </div>
}