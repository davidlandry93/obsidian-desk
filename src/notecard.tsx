import React, {useContext, useState, useEffect, useRef} from 'react'

import { ObsidianContext } from './obsidiancontext'
import { App, TFile, MarkdownRenderer } from 'obsidian'


function navigateToNote(path: string, app: App) {

    console.log("navigating to node", path)
    const note = app.vault.getAbstractFileByPath(path)
    if (note !== null && note instanceof TFile) {
        app.workspace.getLeaf('tab').openFile(note)
    }
}


interface NoteCardProps {
    path: string,
    title: string,
}


export function NoteCard(props: NoteCardProps) {
    const app = useContext(ObsidianContext) as App
    const [body, setBody] = useState("")
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const container = ref.current
        // MarkdownRenderer.renderMarkdown(body, markdownContainer, props.path, null)

        if(container !== null) {
            MarkdownRenderer.renderMarkdown(body, container, props.path, null)
        } else {
            throw new Error("Own container not found")
        }
    }, [body])

    const file = app.vault.getAbstractFileByPath(props.path)

    function onFetch(fileContents: string) {
        setBody(fileContents)
    }

    if (file instanceof TFile) {
        const fileContents = app.vault.cachedRead(file)
        fileContents.then(onFetch)
    } else {
        setBody('Error')
    }

    return <div className='desk__note-card'>
            <a onClick={() => {navigateToNote(props.path, app)}}><h3>{props.title}</h3></a>
            <div className='desk__search-result-content' ref={ref}></div>
        </div>
}