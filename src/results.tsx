import React, {useState, useRef, useEffect, MouseEvent} from 'react'
import { TFile } from 'obsidian'

import { NoteCard } from './notecard'
import { SearchResult } from './domain/searchresult'

const RESULTS_BATCH_SIZE = 20

interface SearchResultsProps {
    results: SearchResult[]
}

export function ResultsDisplay(props: SearchResultsProps) {
    console.log("Results Props")
    console.log(props.results)

    const numberResults = props.results.length
    const [numberResultsShown, setNumberResultsShown] = useState(Math.min(RESULTS_BATCH_SIZE, props.results.length))
    const resultDisplayRef = useRef(null)
    const bottomSensorRef = useRef(null)

    console.log(numberResultsShown)

    function onIntersect(entries: IntersectionObserverEntry[]) {
        if (entries.some(e => e.isIntersecting)) {
            if (numberResults > numberResultsShown) {
                setNumberResultsShown(Math.min(numberResults, numberResultsShown + RESULTS_BATCH_SIZE))
            }
        }
    }

    useEffect(() => {
        setNumberResultsShown(Math.min(RESULTS_BATCH_SIZE, props.results.length))
    }, [props.results])

    useEffect(() => {
        if (bottomSensorRef.current) {
            const observer = new IntersectionObserver(onIntersect)
            observer.observe(bottomSensorRef.current)

            return () => {
                observer.disconnect()
            }
        }
    }, [numberResultsShown])

    const clickHandler = (e: MouseEvent) => {
        const target = e.target

        if (target instanceof HTMLElement && target.nodeName === "A") {
            if ('data-href' in target.attributes) {
                e.stopPropagation()
                const note = app.metadataCache.getFirstLinkpathDest(target.attributes['data-href'].value, "/")

                if (note !== null && note instanceof TFile) {
                    app.workspace.getLeaf('tab').openFile(note)
                }
            }
        }
    }

    const resultItems = props.results.slice(0, numberResultsShown).map(r => <div className='desk__search-result' key={r.path}>
        <NoteCard title={r.title} path={r.path} folder={r.folder} backlinks={r.backlinks} date={r.mtime} />
    </div>)

    return <div>
        <div className='desk__search-result-container' ref={resultDisplayRef} onClick={(e) => clickHandler(e)}>
            {resultItems}
            <div ref={bottomSensorRef} className="desk__results-bottom-sensor"></div>
        </div>
    </div>
}
