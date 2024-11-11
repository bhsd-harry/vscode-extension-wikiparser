import Parser from 'wikilint';
import type {TextDocument} from 'vscode-languageserver-textdocument';
import type {Token} from 'wikilint';

export class Task {
	doc;
	text: string;
	running: Promise<Token> | undefined;

	/** @param doc TextDocument */
	constructor(doc: TextDocument) {
		this.doc = doc;
	}

	/**
	 * 提交解析任务
	 * @description
	 * - 总是更新`text`以便`parse`完成时可以判断是否需要重新解析
	 * - 如果已有进行中的解析，则返回该解析的结果
	 * - 否则开始新的解析
	 */
	queue(): Promise<Token> {
		this.text = this.doc.getText();
		this.running ??= this.parse(this.text);
		return this.running;
	}

	/**
	 * 执行解析
	 * @param wikitext 待解析的文本
	 * @description
	 * - 完成后会检查`=text`是否已更新，如果是则重新解析
	 * - 总是返回最新的解析结果
	 */
	async parse(wikitext: string): Promise<Token> {
		const root = Parser.parse(wikitext, true);
		if (this.text === wikitext) {
			return root;
		}
		this.running = this.parse(this.text);
		return this.running;
	}
}
