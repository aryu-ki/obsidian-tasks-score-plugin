import { App, EventRef, MarkdownRenderChild, Plugin, PluginSettingTab, Setting, Workspace } from 'obsidian';
// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
	debug: boolean;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default',
	debug: false
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();
		console.log(`Debug mode ${this.settings.debug ? 'ON' : 'OFF'}`)
		this.registerMarkdownCodeBlockProcessor("evals", (source, element, context) => {
			const scoreRenderChild = new ScoreRenderChild(element, source, this.app.workspace, this.settings.debug);
			context.addChild(scoreRenderChild);
			scoreRenderChild.load()
		})

		this.addSettingTab(new DebugSettingTab(this.app, this))
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		console.log(`Debug mode ${this.settings.debug ? 'ON' : 'OFF'}`)
		await this.saveData(this.settings);
	}
}

class ScoreRenderChild extends MarkdownRenderChild {
	private source: string
	private workspace: Workspace
	private eventRef: EventRef
	private debug: boolean
	constructor(container: HTMLElement, source: string, workspace: Workspace, debug?: boolean) {
		super(container)
		this.source = source
		this.workspace = workspace
		this.debug = debug == null ? false : debug
	}

	onload(): void {
		this.eventRef = this.workspace.on("editor-change", this.render.bind(this))
		this.workspace.trigger('editor-change')
	}
	
	onunload(): void {
		this.workspace.offref(this.eventRef)
	}

	private async render() {
		const editor = this.workspace.activeEditor?.editor
		if (!editor) {
			if (this.debug) console.log(`[DEBUG] No active editor`)
			return
		}
		const lineCount = editor.lineCount()
			let score = 0
			let targetScore = 0
			if (this.debug) console.log(`[DEBUG] Starting processing`)
			for (let i = 0; i < lineCount; i++) {
				const line = editor.getLine(i)
				if (line.startsWith("- [x")) {
					if (this.debug) console.log(`[DEBUG] Found line containing required score payload: ${line}`)
					const scorePayload = /\[\s*-?(\d+)\s*\]/.exec(line)?.[1]
					if (scorePayload != null) {
						if (this.debug) console.log(`[DEBUG] Matched score payload: ${scorePayload}`)
						if (this.debug) console.log(`[DEBUG] parseInt(scorePayload.trim()): ${parseInt(scorePayload.trim())}`)
						score += parseInt(scorePayload.trim())
						targetScore += parseInt(scorePayload.trim())
					}
				}
				if (line.startsWith("- [ ]")) {
					if (this.debug) console.log(`[DEBUG] Found line containing required score payload: ${line}`)
					const scorePayload = /\[\s*-?(\d+)\s*\]/.exec(line)?.[1]
					if (scorePayload != null) {
						if (this.debug) console.log(`[DEBUG] Matched score payload: ${scorePayload}`)
						if (this.debug) console.log(`[DEBUG] parseInt(scorePayload.trim()): ${parseInt(scorePayload.trim())}`)
						targetScore += parseInt(scorePayload.trim())
					}
				}
			}
			if (this.debug) console.log(`[DEBUG] Processing complete. Final score is ${score}, target score is ${targetScore}`)
        const content = this.containerEl.createEl('h1');
		content.textContent = this.source.replace("!score!", `${score}`).replace("!target_score!", `${targetScore}`);
        this.containerEl.firstChild?.replaceWith(content);
    }
}

class DebugSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
	}

	display(): void {
    let { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
		.setName("Debug")
		.setDesc("Enable console logs for debugging")
		.addToggle((toggle) => {
			toggle.setValue(this.plugin.settings.debug)
			toggle.onChange(async (value) => {
				this.plugin.settings.debug = value;
				await this.plugin.saveSettings();
			})
		}
		);
	}
}