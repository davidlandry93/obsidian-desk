import { ItemView, WorkspaceLeaf, Vault, App, KeymapEventHandler } from "obsidian"
import { ExtendedMetadataCache } from "src/obsidianprivate"
import * as React from "react"
import { createRoot, Root } from "react-dom/client"

export const VIEW_TYPE_DESK = "desk-view"

import { DeskComponent } from './src/desk'
import { ObsidianContext } from './src/obsidiancontext'


export class DeskView extends ItemView {
  vault: Vault
  metadataCache: ExtendedMetadataCache
  results: Array<string>
  root: Root
  escapeHandler: KeymapEventHandler | null

  constructor(leaf: WorkspaceLeaf, app: App) {
    super(leaf);
    this.app = app
    this.vault = app.vault
    this.metadataCache = app.metadataCache as ExtendedMetadataCache
    this.escapeHandler = null
  }

  getViewType() {
    return VIEW_TYPE_DESK;
  }

  getDisplayText() {
    return "Desk";
  }

  onOpen = async () => {
    this.escapeHandler = this.app.scope.register([], 'Escape', () => { });

    const container = this.containerEl.children[1];

    this.root = createRoot(container)
    this.root.render(
      <React.StrictMode>
        <ObsidianContext.Provider value={this.app}>
          <DeskComponent />
        </ObsidianContext.Provider>
      </React.StrictMode>
    )
  }

  onClose = async () => {
    if (this.root) this.root.unmount()
    if (this.escapeHandler) this.app.scope.unregister(this.escapeHandler)
  }
}