import React, {useState, useRef, useEffect} from 'react'

import { NoteCard } from './notecard'

const RESULTS_BATCH_SIZE = 5

export interface SearchResult {
    title: string
    key: string
    body: string
    path: string
  }
  

interface SearchResultsProps {
    results: SearchResult[]
  }

export function ResultsDisplay(props: SearchResultsProps) {
    const numberResults = props.results.length
    const [numberResultsShown, setNumberResultsShown] = useState(Math.min(RESULTS_BATCH_SIZE, numberResults))
    const resultDisplayRef = useRef(null)
    const bottomSensorRef = useRef(null)

    const resultItems = props.results.slice(0, numberResultsShown).map(r => <div className='desk__search-result' key={r.key}>
        <NoteCard title={r.title} path={r.path}  />
    </div>)

    function onIntersect(entries: IntersectionObserverEntry[]) {
        if (entries.some(e => e.isIntersecting)) {
            if (numberResults > numberResultsShown) {
                setNumberResultsShown(Math.min(numberResults, numberResultsShown + RESULTS_BATCH_SIZE))
            }
        }
    }

    useEffect(() => {
        if (bottomSensorRef.current) {
            const observer = new IntersectionObserver(onIntersect)
            observer.observe(bottomSensorRef.current)

            return () => {
                observer.disconnect()
            }
        }
    }, [numberResultsShown])


    return <div>
        <div className='desk__search-result-container' ref={resultDisplayRef}>
            {resultItems}
        </div>
        <div ref={bottomSensorRef}></div>
    </div>
}
