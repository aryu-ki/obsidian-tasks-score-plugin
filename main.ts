import { App, EventRef, MarkdownRenderChild, Plugin, PluginSettingTab, Setting, Workspace } from 'obsidian';
// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		this.registerMarkdownCodeBlockProcessor("evals", (source, element, context) => {
			const scoreRenderChild = new ScoreRenderChild(element, source, this.app.workspace);
			context.addChild(scoreRenderChild);
			scoreRenderChild.load()
		})
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class ScoreRenderChild extends MarkdownRenderChild {
	private source: string
	private workspace: Workspace
	private eventRef: EventRef
	constructor(container: HTMLElement, source: string, workspace: Workspace) {
		super(container)
		this.source = source
		this.workspace = workspace
	}

	onload(): void {
		this.eventRef = this.workspace.on("editor-change", this.render.bind(this))
	}
	
	onunload(): void {
		this.workspace.offref(this.eventRef)
	}

	private async render() {
		const editor = this.workspace.activeEditor?.editor
		if (!editor) {
			return
		}
		const lineCount = editor.lineCount()
			let score = 0
			for (let i = 0; i < lineCount; i++) {
				const line = editor.getLine(i)
				if (line.startsWith("- [x")) {
					console.log(`Found line containing required score payload: ${line}`)
					const scorePayload = /\[\s*-?(\d+)\s*\]/.exec(line)?.[1]
					if (scorePayload != null) {
						console.log(`[DEBUG] Matched score payload: ${scorePayload}`)
						console.log(`[DEBUG] parseInt(scorePayload.trim()): ${parseInt(scorePayload.trim())}`)
						score += parseInt(scorePayload.trim())
					}
				}
			}
        const content = this.containerEl.createEl('h1');
		content.textContent = this.source.replace("!score!", `${score}`);
        this.containerEl.firstChild?.replaceWith(content);
    }
}
