import React, {useState, useRef, useEffect, MouseEvent} from 'react'
import { TFile } from 'obsidian'

import { NoteCard } from './notecard'
import { SearchResult } from './domain/searchresult'
import { Filter } from './filter'

const RESULTS_BATCH_SIZE = 20

interface SearchResultsProps {
    results: SearchResult[]
    addFilter: (filter: Filter) => void
}

export function ResultsDisplay(props: SearchResultsProps) {
    const numberResults = props.results.length
    const [numberResultsShown, setNumberResultsShown] = useState(Math.min(RESULTS_BATCH_SIZE, props.results.length))
    const resultDisplayRef = useRef(null)
    const bottomSensorRef = useRef(null)

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
                // Internal link. Navigate to that note.
                e.stopPropagation()
                const data_href_value = target.attributes.getNamedItem('data-href')

                if (data_href_value) {
                    const note = app.metadataCache.getFirstLinkpathDest(data_href_value?.value, "/")
                    if (note !== null && note instanceof TFile) {
                        app.workspace.getLeaf('tab').openFile(note)
                    }
                }
            } else if (target.classList.contains('tag'))  {
                // Clicked on tag. Add tag to filters.
                e.stopPropagation()

                const href = target.attributes.getNamedItem("href") as {value: string}

                props.addFilter({
                    'type': 'tag',
                    'value': href.value
                })
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
