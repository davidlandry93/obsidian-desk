import { App } from "obsidian";
import { ExtendedMetadataCache } from "./obsidianprivate";

export function getMetadataCache(app: App): ExtendedMetadataCache {
    return app.metadataCache as ExtendedMetadataCache
}