import { DateTime } from 'luxon'

export interface SearchResult {
    title: string
    path: string
    size: number
    ctime: DateTime
    mtime: DateTime
    folder: string
    backlinks: number
}

type Link = any

export interface DataviewFile {
    ctime: DateTime,
    mtime: DateTime,
    name: string,
    path: string,
    size: number,
    folder: string,
    inlinks: Link[]
}

export function dataviewFileToSearchResult(dvFile: DataviewFile): SearchResult {
    return {
        title: dvFile.name,
        path: dvFile.path,
        size: dvFile.size,
        ctime: dvFile.ctime,
        mtime: dvFile.mtime,
        folder: dvFile.folder, // Dataview returns an empty string if no parent.
        backlinks: dvFile.inlinks.length
    }
}