import {createHash} from 'crypto';
import Parser from 'wikilint';
import type {Connection} from 'vscode-languageserver/node';
import type {TextDocument} from 'vscode-languageserver-textdocument';
import type {Token} from 'wikilint';

const debugging = process.argv.includes('--debug');

export class Task {
	doc;
	connection;
	text: string;
	running: Promise<Token> | undefined;
	done: Token | undefined;

	/** @class */
	constructor(doc: TextDocument, connection: Connection) {
		this.doc = doc;
		this.connection = connection;
	}

	/**
	 * 提交解析任务
	 * @description
	 * - 总是更新`text`以便`parse`完成时可以判断是否需要重新解析
	 * - 如果已有进行中的解析，则返回该解析的结果
	 * - 否则开始新的解析
	 */
	async queue(): Promise<Token> {
		const text = this.doc.getText();
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
		if (debugging) {
			this.connection.console.debug(`Parsing document ${createHash('md5').update(text).digest('hex')}`);
		}
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
