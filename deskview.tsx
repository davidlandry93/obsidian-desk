import { ItemView, WorkspaceLeaf, Vault } from "obsidian"
import { ExtendedMetadataCache } from "ExtendedObsidian"
import * as React from "react"
import { createRoot, Root } from "react-dom/client"

export const VIEW_TYPE_DESK = "desk-view"

import DeskComponent from './components/desk'


export class DeskView extends ItemView {
    vault: Vault
    metadataCache: ExtendedMetadataCache
    results: Array<string>
    root: Root

    constructor(leaf: WorkspaceLeaf, vault: Vault, metadataCache: ExtendedMetadataCache) {
      super(leaf);
      this.vault = vault
      this.metadataCache = metadataCache
    }
  
    getViewType() {
      return VIEW_TYPE_DESK;
    }
  
    getDisplayText() {
      return "Desk";
    }
  
    async onOpen() {
        const container = this.containerEl.children[1];

        this.root = createRoot(container)
        this.root.render(
          <React.StrictMode>
            <DeskComponent vault={this.vault} />
          </React.StrictMode>
        )
    }
  
    async onClose() {
      this.root.unmount()
    }
  }