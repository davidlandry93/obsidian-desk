import { DateTime } from 'luxon'

export interface SearchResult {
    title: string
    path: string
    size: number
    ctime: DateTime
    mtime: DateTime
}

export interface DataviewFile {
    ctime: DateTime,
    mtime: DateTime,
    name: string,
    path: string,
    size: number,
}

export function dataviewFileToSearchResult(dvFile: DataviewFile): SearchResult {
    return {
        title: dvFile.name,
        path: dvFile.path,
        size: dvFile.size,
        ctime: dvFile.ctime,
        mtime: dvFile.mtime,
    }
}