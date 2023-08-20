import { Plugin } from 'obsidian';

import { DeskView, VIEW_TYPE_DESK } from 'deskview';
import { ExtendedMetadataCache } from 'src/obsidianprivate';

// Remember to rename these classes and interfaces!


export default class MyPlugin extends Plugin {
	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('lamp-desk', 'Desk View', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			this.activateView();
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		this.registerDomEvent(document, 'keyup', (evt: KeyboardEvent) => {
			if (evt.key === "Escape") {
				console.log("Main got escape down")
				evt.stopPropagation()
			}
		})

		this.addCommand({
			id: "create-desk",
			name: "Create new desk",
			callback: () => { this.activateView() }
		})

		this.registerView(VIEW_TYPE_DESK, (leaf) => { return new DeskView(leaf, this.app.vault, this.app.metadataCache as ExtendedMetadataCache) });
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_DESK)
	}

	async loadSettings() {
	}

	async saveSettings() {
	}

	async activateView() {
		const leaf = await this.app.workspace.getLeaf(true)

		leaf.setViewState({
			type: VIEW_TYPE_DESK,
			active: true,
		});

		this.app.workspace.revealLeaf(leaf);
	}
}
