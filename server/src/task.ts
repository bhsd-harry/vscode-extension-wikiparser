import {createHash} from 'crypto';
import {createConnection, ProposedFeatures} from 'vscode-languageserver/node';
import Parser from 'wikilint';
import type {TextDocument} from 'vscode-languageserver-textdocument';
import type {Token} from 'wikilint';

const debugging = process.argv.includes('--debug');

export const connection = createConnection(ProposedFeatures.all);

export const debug = (arg: unknown): void => {
	if (debugging) {
		connection.console.debug(typeof arg === 'object' ? JSON.stringify(arg, null, '\t') : String(arg));
	}
};

export class Task {
	doc;
	text: string;
	running: Promise<Token> | undefined;
	done: Token | undefined;

	/** @class */
	constructor(doc: TextDocument) {
		this.doc = doc;
	}

	/**
	 * 提交解析任务
	 * @param text 源代码
	 * @description
	 * - 总是更新`text`以便`parse`完成时可以判断是否需要重新解析
	 * - 如果已有进行中的解析，则返回该解析的结果
	 * - 否则开始新的解析
	 */
	async queue(text = this.doc.getText()): Promise<Token> {
		if (this.text === text && !this.running && this.done) {
			return this.done;
		}
		this.text = text;
		this.running ??= new Promise(resolve => {
			setImmediate(() => {
				resolve(this.#parse());
			});
		});
		return this.running;
	}

	/**
	 * 执行解析
	 * @description
	 * - 完成后会检查`text`是否已更新，如果是则重新解析
	 * - 总是返回最新的解析结果
	 */
	async #parse(): Promise<Token> {
		const {text} = this;
		debug(`Parsing document ${createHash('md5').update(text).digest('hex')}`);
		const root = Parser.parse(text, true);
		if (this.text === text) {
			this.done = root;
			this.running = undefined;
			return root;
		}
		this.running = this.#parse();
		return this.running;
	}
}
