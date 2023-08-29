import { Plugin } from 'obsidian';

import { DeskView, VIEW_TYPE_DESK } from 'deskview';

// Remember to rename these classes and interfaces!


export default class DeskPlugin extends Plugin {
	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		this.addRibbonIcon('lamp-desk', 'Create new desk', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			this.activateView();
		});

		this.registerDomEvent(document, 'keyup', (evt: KeyboardEvent) => {
			if (evt.key === "Escape") {
				evt.stopPropagation()
			}
		})

		this.addCommand({
			id: "create-desk",
			name: "Create new desk",
			callback: () => { this.activateView() }
		})

		this.registerView(VIEW_TYPE_DESK, (leaf) => {
			return new DeskView(leaf, this.app)
		});
	}

	async loadSettings() {
	}

	async saveSettings() {
	}

	async activateView() {
		const leaf = this.app.workspace.getLeaf(true)

		leaf.setViewState({
			type: VIEW_TYPE_DESK,
			active: true,
		});

		this.app.workspace.revealLeaf(leaf);
	}
}
