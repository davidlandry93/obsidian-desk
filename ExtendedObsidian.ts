import { MetadataCache } from "obsidian";

interface TagMetadata {
    [key: string]: number
}

export interface ExtendedMetadataCache extends MetadataCache {
    getTags(): TagMetadata
}