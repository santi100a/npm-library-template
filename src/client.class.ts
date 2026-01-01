import { createHash } from 'node:crypto';
import { Socket } from 'node:net';
import { assertTypeOf } from '@santi100a/assertion-lib';
import type {
	DictDefinition,
	DefineResponse,
	DatabaseResponse,
	GreetingResponse,
	DictResponse,
	InfoResponse,
	MatchResponse,
	MatchEntry,
	DatabaseInfo,
	StrategiesResponse,
	HelpResponse
} from './types';
import { createLineReader } from './lib/libreadline';
import assertEqual = require('@santi100a/assertion-lib/cjs/equal');

export default class DictClient {
	// Properties

	/**
	 * The URL for the DICT server, passed either in the constructor or in the {@link DictClient.connect()} method.
	 */
	url: URL = new URL('dict://');

	/**
	 * Whether or not the client is connected to a server right now.
	 */
	connected: boolean = false;

	/**
	 * An error object in case something went wrong, `null` otherwise.
	 */
	connectionError: Error | null = null;

	/**
	 * Stores server capabilities after connection is established.
	 */
	capabilities: string[] = [];

	/**
	 * Stores message ID after connection is established.
	 */
	messageId: string = '';

	// Constructor

	/**
	 * Creates a new `DictClient`.
	 */
	constructor();
	/**
	 * Creates a new `DictClient`.
	 *
	 * @param {URL} url - A URL object representing the DICT server address. Must have protocol `dict://`.
	 * @throws If the URL protocol is not `dict://`.
	 */
	constructor(url: URL);
	/**
	 * Creates a new `DictClient`. You must call {@link DictClient.connect()} before calling other methods.
	 *
	 * @param {string} address - The hostname or IP address of the DICT server. The default port is 2628.
	 */
	constructor(address: string);
	/**
	 * Creates a new `DictClient`. You must call {@link DictClient.connect()} before calling other methods.
	 *
	 * @param {string} address - The hostname or IP address of the DICT server.
	 * @param {number} [port=2628] - The port number of the DICT server.
	 */
	constructor(address: string, port: number);
	constructor(url: URL | string = new URL('dict://'), port = 2628) {
		this.__client = new Socket();
		this.__readLine = createLineReader(this.__client);
		const urlText =
			typeof url === 'string' && !url.startsWith('dict://')
				? 'dict://'.concat(url)
				: url;
		this.url = url instanceof URL ? url : new URL(urlText);
		if (this.url.port === '') this.url.port = String(port);
		if (this.url.protocol === '') this.url.protocol = 'dict:';

		assertEqual(this.url.protocol, 'dict:', 'url.protocol');
	}

	/**
	 * Connects to the DICT server specified in the constructor. Must be called before any other method.
	 * Accepts greeting banners with or without capabilities and/or message ID.
	 *
	 * @returns A promise that resolves to a {@link GreetingResponse} object, containing server greeting information.
	 * @throws If something goes wrong with the connection, the server returns an error, or the greeting format is invalid.
	 */
	async connect(): Promise<GreetingResponse>;
	/**
	 * Connects to a DICT server, or disconnects from the current DICT server and connects to another.
	 * Must be called before any other method. Accepts greeting banners with or without capabilities and/or message ID.
	 *
	 * @param {URL} url - A URL object representing the DICT server address. Must have protocol `dict://`.
	 * @returns A promise that resolves to a {@link GreetingResponse} object, containing server greeting information.
	 * @throws If something goes wrong with the connection, the server returns an error, or the greeting format is invalid.
	 */
	async connect(url: URL): Promise<GreetingResponse>;
	async connect(url = this.url): Promise<GreetingResponse> {
		if (url !== this.url) {
			this.disconnect();
			this.url = url;
		}
		if (this.url.port === '') this.url.port = '2628';
		return new Promise((resolve, reject) => {
			this.__client.connect({
				host: url.hostname,
				port: Number(url.port)
			});

			this.__client.once('connect', async () => {
				try {
					const rawLine = await this.__readLine();

					const statusMatch = /^(\d{3})\s+(.+)$/.exec(rawLine);

					if (!statusMatch) {
						reject(new Error('Invalid DICT greeting format'));
						return;
					}

					const [, statusCode, rest] = statusMatch;
					const ok = statusCode === '220';
					if (!ok) reject(new Error(`Connection failed: ${rawLine}`));

					const capMatch = /<([^>]+)>/.exec(rest);
					const capabilities = capMatch ? capMatch[1].split('.') : [];

					const msgIdMatch = /<([^>]+)>\s*$/.exec(rest);
					const messageId = msgIdMatch ? msgIdMatch[1] : '';

					const message = rest.replace(/<[^>]+>/g, '').trim();

					this.messageId = messageId;
					this.capabilities = capabilities;
					this.connected = true;

					resolve({
						status: Number(statusCode),
						ok,
						message,
						capabilities,
						messageId
					});
				} catch (error) {
					reject(error);
				}
			});

			this.__client.once('error', error => {
				reject(error);
			});
			this.__client.on('close', () => {
				this.connected = false;
			});
		});
	}
	// Command functions

	/**
	 * Defines a word using the server.
	 *
	 * @param {string} dictionary - The database (i.e. dictionary) to use for the definition.
	 * Can be '*' for all available databases or '!' for the first database that matches.
	 * Otherwise, should be one of the choices returned by {@link DictClient.showDatabases()}.
	 * @param {string} headword - The word to define.
	 * @returns A promise that resolves to a {@link DefineResponse} object, containing the definition results.
	 * @throws If the connection is not established, a connection error occurred, or the server returns an invalid response.
	 */
	async define(dictionary: string, headword: string): Promise<DefineResponse> {
		assertTypeOf(dictionary, 'string', 'dictionary');
		assertTypeOf(headword, 'string', 'headword');

		if (!this.connected) {
			throw new Error('Connection not established');
		}
		if (this.connectionError) {
			throw new Error('Connection error occurred');
		}

		const safeDictionary = this.__sanitize(dictionary);
		const safeHeadword = this.__sanitize(headword);

		// Properly quote the headword if it contains spaces
		const quotedHeadword = safeHeadword.includes(' ')
			? `"${safeHeadword}"`
			: safeHeadword;
		this.__client.write(`DEFINE ${safeDictionary} ${quotedHeadword}\r\n`);

		// Read initial status line (e.g., "150 n definitions retrieved")
		const statusLine = await this.__readLine();
		const statusMatch = /^(\d{3})\s+(.+)$/.exec(statusLine);
		const [, statusCode, message] = statusMatch ?? [];
		const ok = statusCode === '150';

		if (!ok) {
			// No definitions found (e.g., 552 no match)
			return {
				status: Number(statusCode),
				ok,
				message,
				count: 0,
				definitions: [],
				finalStatus: null
			};
		}

		// Extract count from message (e.g., "150 3 definitions retrieved")
		const countMatch = /^(\d+)/.exec(message);
		const count = countMatch ? Number(countMatch[1]) : 0;

		const definitions: DictDefinition[] = [];

		// Each definition has: 151 line, body, terminator
		for (let i = 0; i < count; i++) {
			// Read 151 status line (e.g., "151 "word" database "Database Name"")
			const defStatusLine = await this.__readLine();
			const defMatch = /^151\s+"([^"]+)"\s+(\S+)\s+"([^"]+)"/.exec(
				defStatusLine
			);

			if (!defMatch) {
				throw new Error(`Invalid definition header: ${defStatusLine}`);
			}

			const [, headwordFromServer, dictionaryName, dictionaryDescription] =
				defMatch;

			// Read definition body until terminator
			const definitionLines: string[] = [];
			while (true) {
				const rawLine = await this.__readLine();
				if (rawLine === '.') {
					break;
				}
				definitionLines.push(rawLine);
			}

			definitions.push({
				headword: headwordFromServer,
				dictionary: dictionaryName,
				dictionaryDescription,
				definition: definitionLines.join('\n')
			});
		}

		// Read final status line (e.g., "250 ok")
		const finalStatusLine = await this.__readLine();
		const finalStatusMatch = /^(\d{3})\s+(.+)$/.exec(finalStatusLine);
		const [, finalStatusCode, finalStatusMessage] = finalStatusMatch ?? [];

		return {
			status: Number(statusCode),
			ok,
			message,
			count,
			definitions,
			finalStatus: {
				status: Number(finalStatusCode),
				ok: Number(finalStatusCode) === 250,
				message: finalStatusMessage
			}
		};
	}
	/**
	 * Matches a word using the server.
	 *
	 * @param {string} dictionary - Where to search for a word.
	 * Can be "*" for all available databases.
	 * Otherwise, should be one of the choices returned by {@link DictClient.showDatabases()}.
	 *
	 * @param {string} strategy - The matching strategy to use
	 * (e.g., "exact", "prefix", "suffix", "substring", "levenshtein", etc.).
	 * Can be '*' for any strategy or '.' for the default strategy.
	 * Otherwise, should be one of the choices returned by {@link DictClient.showStrategies()}.
	 *
	 * @param {string} headword - The word to match.
	 *
	 * @returns A promise that resolves to a {@link MatchResponse} object, containing the match results.
	 * @throws If the connection is not established, a connection error occurred, or the server returns an invalid response.
	 */
	async match(
		dictionary: string,
		strategy: string,
		headword: string
	): Promise<MatchResponse> {
		assertTypeOf(dictionary, 'string', 'dictionary');
		assertTypeOf(strategy, 'string', 'strategy');
		assertTypeOf(headword, 'string', 'headword');

		if (!this.connected) {
			throw new Error('Connection not established');
		}
		if (this.connectionError) {
			throw new Error('Connection error occurred');
		}

		const safeDictionary = this.__sanitize(dictionary);
		const safeStrategy = this.__sanitize(strategy);
		const safeHeadword = this.__sanitize(headword);

		// Properly quote the headword if it contains spaces
		const quotedHeadword = safeHeadword.includes(' ')
			? `"${safeHeadword}"`
			: safeHeadword;
		this.__client.write(
			`MATCH ${safeDictionary} ${safeStrategy} ${quotedHeadword}\r\n`
		);

		// Read initial status line (e.g., "152 5 matches")
		const statusLine = await this.__readLine();
		const statusMatch = /^(\d{3})\s+(.+)$/.exec(statusLine);
		const [, statusCode, message] = statusMatch ?? [];
		const ok = statusCode === '152';

		const matches: MatchEntry[] = [];

		if (!ok)
			return {
				status: Number(statusCode),
				ok,
				message,
				matches,
				count: 0,
				finalStatus: null
			};
		while (true) {
			const rawLine = await this.__readLine();

			// End of list marker
			if (rawLine === '.') {
				break;
			}

			const dbMatch = /^(\S+)\s+"(.+)"$/.exec(rawLine);
			if (dbMatch) {
				const [, dictionary, word] = dbMatch;
				matches.push({ dictionary, word });
			}
		}

		// Read final status line (e.g., "250 ok")
		const finalStatusLine = await this.__readLine();
		const [finalStatusCode, finalStatusMessage] = finalStatusLine.split(' ');

		return {
			status: Number(statusCode),
			ok,
			count: matches.length,
			message,
			matches,
			finalStatus: {
				status: Number(finalStatusCode),
				ok: Number(finalStatusCode) === 250,
				message: finalStatusMessage
			}
		};
	}
	/**
	 * Returns a list of databases (dictionaries) available on the server.
	 *
	 * @returns A promise that resolves to an {@link DatabaseResponse} object containing all available databases.
	 * @throws If something is wrong with the connection or the response is unexpected.
	 */
	async showDatabases(): Promise<DatabaseResponse> {
		if (!this.connected) {
			throw new Error('Connection not established');
		}
		if (this.connectionError) {
			throw new Error('Connection error occurred');
		}

		this.__client.write('SHOW DATABASES\r\n');

		// Read initial status line (e.g., "110 5 databases present")
		const statusLine = await this.__readLine();
		const statusMatch = /^(\d{3})\s+(.+)$/.exec(statusLine);
		const [, statusCode, message] = statusMatch ?? [];
		const ok = statusCode === '110';

		if (!ok) {
			throw new Error(`Unexpected response: ${statusLine}`);
		}

		const databases: DatabaseInfo[] = [];

		while (true) {
			const rawLine = await this.__readLine();

			// End of list marker
			if (rawLine === '.') {
				break;
			}

			const dbMatch = /^(\S+)\s+"(.+)"$/.exec(rawLine);
			if (dbMatch) {
				const [, name, description] = dbMatch;
				databases.push({ name, description });
			}
		}

		// Read final status line (e.g., "250 ok")
		const finalStatusLine = await this.__readLine();
		const [finalStatusCode, finalStatusMessage] = finalStatusLine.split(' ');

		return {
			status: Number(statusCode),
			ok,
			message,
			databases,
			finalStatus: {
				status: Number(finalStatusCode),
				ok: Number(finalStatusCode) === 250,
				message: finalStatusMessage
			}
		};
	}
	/**
	 * Returns a list of valid strategies available on the server to use with the `MATCH` command.
	 *
	 * @returns A promise that resolves to a {@link StrategiesResponse} object containing all available match strategies.
	 * @throws If something is wrong with the connection or the response is unexpected.
	 */
	async showStrategies(): Promise<StrategiesResponse> {
		if (!this.connected) {
			throw new Error('Connection not established');
		}
		if (this.connectionError) {
			throw new Error('Connection error occurred');
		}

		this.__client.write('SHOW STRATEGIES\r\n');

		// Read initial status line (e.g., "110 5 databases present")
		const statusLine = await this.__readLine();
		const statusMatch = /^(\d{3})\s+(.+)$/.exec(statusLine);
		const [, statusCode, message] = statusMatch ?? [];

		const ok = statusCode === '111';

		if (!ok) {
			throw new Error(`Unexpected response: ${statusLine}`);
		}

		const strategies: { name: string; description: string }[] = [];

		while (true) {
			const rawLine = await this.__readLine();

			// End of list marker
			if (rawLine === '.') {
				break;
			}

			const dbMatch = /^(\S+)\s+"(.+)"$/.exec(rawLine);
			if (dbMatch) {
				const [, name, description] = dbMatch;
				strategies.push({ name, description });
			}
		}

		// Read final status line (e.g., "250 ok")
		const finalStatusLine = await this.__readLine();
		const [finalStatusCode, finalStatusMessage] = finalStatusLine.split(' ');

		return {
			status: Number(statusCode),
			ok,
			message,
			strategies,
			finalStatus: {
				status: Number(finalStatusCode),
				ok: Number(finalStatusCode) === 250,
				message: finalStatusMessage
			}
		};
	}

	/**
	 * Retrieves information about a specific database (i.e. dictionary).
	 *
	 * @param {string} dictionary - The database to get information about.
	 * @returns A promise that resolves to an {@link InfoResponse} object containing information about a database.
	 * @throws If something is wrong with the connection or the response is unexpected.
	 */
	async showInfo(dictionary: string): Promise<InfoResponse> {
		assertTypeOf(dictionary, 'string', 'dictionary');
		if (!this.connected) {
			throw new Error('Connection not established');
		}
		if (this.connectionError) {
			throw new Error('Connection error occurred');
		}

		this.__client.write(`SHOW INFO ${this.__sanitize(dictionary)}\r\n`);

		// Read initial status line ("112 info follows")
		const statusLine = await this.__readLine();
		const statusMatch = /^(\d{3})\s+(.+)$/.exec(statusLine);
		const [, statusCode, message] = statusMatch ?? [];
		const lines = [];

		const ok = statusCode === '112';

		if (!ok) {
			return {
				status: Number(statusCode),
				ok,
				message,
				info: null,
				finalStatus: null
			};
		}

		while (true) {
			const rawLine = await this.__readLine();

			// End of list marker
			if (rawLine === '.') {
				break;
			}
			lines.push(rawLine);
		}

		// Read final status line (e.g., "250 ok")
		const finalStatusLine = await this.__readLine();
		const [finalStatusCode, finalStatusMessage] = finalStatusLine.split(' ');

		return {
			status: Number(statusCode),
			ok,
			message,
			info: lines.join('\n'),
			finalStatus: {
				status: Number(finalStatusCode),
				ok: Number(finalStatusCode) === 250,
				message: finalStatusMessage
			}
		};
	}

	/**
	 * Retrieves information about the server.
	 *
	 * @returns A promise that resolves to an {@link InfoResponse} object containing information about the current server.
	 * @throws If something is wrong with the connection or the response is unexpected.
	 */
	async showServer(): Promise<InfoResponse> {
		if (!this.connected) {
			throw new Error('Connection not established');
		}
		if (this.connectionError) {
			throw new Error('Connection error occurred');
		}

		this.__client.write('SHOW SERVER\r\n');

		// Read initial status line ("114 info follows")
		const statusLine = await this.__readLine();
		const statusMatch = /^(\d{3})\s+(.+)$/.exec(statusLine);
		const [, statusCode, message] = statusMatch ?? [];
		const lines = [];

		const ok = statusCode === '114';

		if (!ok) {
			throw new Error(`Unexpected response: ${statusLine}`);
		}
		while (true) {
			const rawLine = await this.__readLine();

			// End of list marker
			if (rawLine === '.') {
				break;
			}
			lines.push(rawLine);
		}

		// Read final status line (e.g., "250 ok")
		const finalStatusLine = await this.__readLine();
		const [finalStatusCode, finalStatusMessage] = finalStatusLine.split(' ');

		return {
			status: Number(statusCode),
			ok,
			message,
			info: lines.join('\n'),
			finalStatus: {
				status: Number(finalStatusCode),
				ok: Number(finalStatusCode) === 250,
				message: finalStatusMessage
			}
		};
	}
	/**
	 * Sends an `OPTION` command to the server to enable additional features.
	 * Depends on the server; run {@link DictClient.help()} first for more information.
	 *
	 * @param {string[]} options - One parameter per word in the command:
	 * @example
	 * ```
	 * client.option('MIME'); // most common
	 * client.option('UTF8');
	 * client.option('FOO', 'ON'); // will send command "OPTION FOO ON"
	 * ```
	 * @returns A promise that resolves to a {@link DictResponse} object containing the response from the server.
	 * @throws If something is wrong with the connection or the response format.
	 */
	async option(...options: string[]): Promise<DictResponse> {
		if (!this.connected) {
			throw new Error('Connection not established');
		}
		if (this.connectionError) {
			throw new Error('Connection error occurred');
		}
		const cleanOptions = options.map(this.__sanitize);

		this.__client.write(`OPTION ${cleanOptions.join(' ')}\r\n`);

		const rawLine = await this.__readLine();

		const statusMatch = /^(\d{3})\s+(.+)$/.exec(rawLine);

		if (!statusMatch) {
			throw new Error('Invalid DICT status format');
		}

		const [, statusCode, rest] = statusMatch;
		const message = rest.trim();

		return {
			status: Number(statusCode),
			ok: Number(statusCode) === 250,
			message
		};
	}
	/**
	 * Sends the `CLIENT` command to the server.
	 *
	 * @returns A promise that resolves to a `DictResponse` object containing the server's response.
	 * @throws If something is wrong with the connection or the response format.
	 */
	async client(): Promise<DictResponse>;
	/**
	 * Identifies the client before the server.
	 *
	 * @param userAgent - The client string to be sent to the server.
	 * @returns A promise that resolves to a `DictResponse` object containing the server's response.
	 * @throws If something is wrong with the connection or the response format.
	 */
	async client(userAgent: string): Promise<DictResponse>;
	async client(userAgent = ''): Promise<DictResponse> {
		assertTypeOf(userAgent, 'string', 'userAgent');
		if (!this.connected) {
			throw new Error('Connection not established');
		}
		if (this.connectionError) throw new Error('Connection error occurred');

		const cleanUserAgent = this.__sanitize(userAgent);
		this.__client.write(`CLIENT ${cleanUserAgent ?? ''}\r\n`);
		const rawLine = await this.__readLine();

		const clientMatch = /^(\d{3})\s+(.+)$/.exec(rawLine);
		if (!clientMatch) {
			throw new Error('Invalid DICT CLIENT response format');
		}
		const [, statusCode, rest] = clientMatch;
		const message = rest.trim();
		return {
			status: Number(statusCode),
			ok: Number(statusCode) === 250,
			message
		};
	}

	/**
	 * Authenticates before the server using APOP auth (i.e. the MD5 hash of (the message ID + the password)).
	 *
	 * @param username - The username for the server.
	 * @param password - The password for the server.
	 * @returns A promise that resolves to a `DictResponse` object containing the server's response
	 * (e.g.: 230 OK, 531 auth error, 502 unsupported).
	 * @throws If something is wrong with the connection or the response format.
	 */

	async auth(): Promise<DictResponse>;

	/**
	 * Authenticates before the server using APOP auth (i.e. the MD5 hash of (the message ID + the password)).
	 *
	 * @param username - The username for the server.
	 * @param password - The password for the server.
	 * @returns A promise that resolves to a `DictResponse` object containing the server's response
	 * (e.g.: 230 OK, 531 auth error, 502 unsupported).
	 * @throws If something is wrong with the connection or the response format.
	 */
	async auth(username: string, password: string): Promise<DictResponse>;
	async auth(username?: string, password?: string): Promise<DictResponse> {
		if (!this.connected) throw new Error('Connection not established');
		if (this.connectionError) throw new Error('Connection error occurred');
		const cleanUsername = this.__sanitize(username ?? this.url.username ?? '');
		const cleanPassword = this.__sanitize(password ?? this.url.password ?? '');
		this.__client.write(
			// Hash format: MD5(<messageId>authString) per RFC 2229
			`AUTH ${cleanUsername} ${createHash('md5')
				.update('<'.concat(this.messageId, '>', cleanPassword))
				.digest('hex')}\r\n`
		);
		const rawLine = await this.__readLine();

		const authMatch = /^(\d{3})\s+(.+)$/.exec(rawLine);
		if (!authMatch) {
			throw new Error('Invalid DICT AUTH response format');
		}
		const [, statusCode, rest] = authMatch;
		const message = rest.trim();
		return {
			status: Number(statusCode),
			ok: Number(statusCode) === 230,
			message
		};
	}

	/**
	 * Requests status information from the server.
	 *
	 * @returns A promise that resolves to a {@link DictResponse} object containing server status information.
	 * @throws If something is wrong with the connection or the response format.
	 */
	async status(): Promise<DictResponse> {
		if (!this.connected) {
			throw new Error('Connection not established');
		}
		if (this.connectionError) {
			throw new Error('Connection error occurred');
		}

		this.__client.write('STATUS\r\n');

		const rawLine = await this.__readLine();

		const statusMatch = /^(\d{3})\s+(.+)$/.exec(rawLine);

		if (!statusMatch) {
			throw new Error('Invalid DICT status format');
		}

		const [, statusCode, rest] = statusMatch;
		const message = rest.trim();

		return {
			status: Number(statusCode),
			ok: Number(statusCode) === 210,
			message
		};
	}
	/**
	 * Retrieves help information from the server.
	 *
	 * @returns A promise that resolves to a {@link HelpResponse} containing help text from the server.
	 * @throws If something is wrong with the connection or the response is unexpected.
	 */
	async help(): Promise<HelpResponse> {
		if (!this.connected) {
			throw new Error('Connection not established');
		}
		if (this.connectionError) {
			throw new Error('Connection error occurred');
		}

		this.__client.write(`HELP\r\n`);

		// Read initial status line ("113 help text follows")
		const statusLine = await this.__readLine();
		const statusMatch = /^(\d{3})\s+(.+)$/.exec(statusLine);
		const [, statusCode, message] = statusMatch ?? [];
		const lines = [];

		const ok = statusCode === '113';

		if (!ok) throw new Error(`Unexpected response: ${statusLine}`);

		while (true) {
			const rawLine = await this.__readLine();

			// End of list marker
			if (rawLine === '.') {
				break;
			}
			lines.push(rawLine);
		}

		// Read final status line (e.g., "250 ok")
		const finalStatusLine = await this.__readLine();
		const [finalStatusCode, finalStatusMessage] = finalStatusLine.split(' ');

		return {
			status: Number(statusCode),
			ok,
			message,
			helpText: lines.join('\n'),
			finalStatus: {
				status: Number(finalStatusCode),
				ok: Number(finalStatusCode) === 250,
				message: finalStatusMessage
			}
		};
	}
	/**
	 * Sends the `QUIT` command to the server and disconnects.
	 * @returns A promise that resolves to a {@link DictResponse} object containing the server's response.
	 * @throws If something is wrong with the connection or the response format.
	 */
	async quit(): Promise<DictResponse> {
		if (!this.connected) {
			throw new Error('Connection not established');
		}
		if (this.connectionError) {
			throw new Error('Connection error occurred');
		}

		this.__client.write(`QUIT\r\n`);

		const rawLine = await this.__readLine();

		const statusMatch = /^(\d{3})\s+(.+)$/.exec(rawLine);

		if (!statusMatch) {
			throw new Error('Invalid DICT status format');
		}

		const [, statusCode, rest] = statusMatch;
		const message = rest.trim();

		this.connectionError = null;

		// Set connected to false BEFORE ending the socket
		this.connected = false;

		try {
			this.__client.end();
		} catch (error) {
			this.connectionError =
				error instanceof Error ? error : new Error(String(error));
		}

		return {
			status: Number(statusCode),
			ok: Number(statusCode) === 221,
			message
		};
	}

	// Other functions

	/**
	 * Enables MIME support on the server, if available. Alias for `client.option('MIME')`.
	 *
	 * @see {@link DictClient.option()}
	 */
	async mime() {
		return this.option('MIME');
	}
	/**
	 * Disconnects from a server if connected, does nothing otherwise.
	 *
	 * @see {@link DictClient.quit()}
	 */
	async disconnect(): Promise<void> {
		if (!this.connected) return;
		await this.quit();
	}

	// Private members
	/**
	 * Sanitizes user input to prevent command injection via CRLF sequences
	 * @private - Not for use outside
	 */
	private __sanitize(input: string): string {
		// Remove CR and LF characters
		return input.replace(/[\r\n]/g, '');
	}
	/**
	 * Socket for connection
	 * @private - Not for use outside
	 */
	private readonly __client: Socket;
	/**
	 * Reads lines asynchronously from the socket
	 * @private - Not for use outside
	 */
	private readonly __readLine: () => Promise<string>;
}
