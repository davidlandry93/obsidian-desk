import { MetadataCache } from "obsidian";

interface TagMetadata {
    [key: string]: number
}

interface LinkSuggestion {
    file: any,
    path: string,
}

export interface ExtendedMetadataCache extends MetadataCache {
    getTags(): TagMetadata
    getLinkSuggestions(): LinkSuggestion[]
}
