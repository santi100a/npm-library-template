/** The basic response type for the DICT protocol. */
export interface DictResponse {
	/** The status code of the response. */
	readonly status: number;
	/** Whether or not the status code equals a specific success code. */
	readonly ok: boolean;
	/** A string accompanying the status code in the server response, usually explaining such code (e.g. "no match" for 552). */
	readonly message: string;
}
/**
 * The response type for DICT commands that may have a secondary status code (e.g. responses for `DEFINE` and `MATCH`).
 */
interface DualStatusResponse extends DictResponse {
	/** The final status object of the response (if any), `null` otherwise. */
	readonly finalStatus: DictResponse | null;
}
/** An object containing information about the DICT server banner sent when the connection is established correctly. */
export interface GreetingResponse extends DictResponse {
	/** An array including the capabilities announced by the server in the welcome banner (e.g. "auth", "mime"). */
	readonly capabilities: string[];
	/** The message ID announced by the server in the welcome banner. */
	readonly messageId: string;
}
/** Information about a DICT database (i.e. a dictionary). */
export interface DatabaseInfo {
	/** The name of the DICT database (dictionary). */
	readonly name: string;
	/** The description string of the DICT database (dictionary). */
	readonly description: string;
}
/** Information about a matching strategy. */
export interface StrategyInfo {
	/** The name of a matching strategy. */
	readonly name: string;
	/** The description string of a matching strategy. */
	readonly description: string;
}
/** The response type for the `SHOW STRATEGIES` command. */
export interface DatabaseResponse extends DualStatusResponse {
	/** An array including the databases available on the server. */
	readonly databases: DatabaseInfo[];
}
/** The response type for the `SHOW STRATEGIES` command. */
export interface StrategiesResponse extends DualStatusResponse {
	/** An array including the matching strategies available on the server. */
	readonly strategies: StrategyInfo[];
}
/** The response type for the `SHOW INFO <db>` command. */
export interface InfoResponse extends DualStatusResponse {
	/** The info text (if applicable, `null` otherwise). */
	readonly info: string | null;
}
/** The response type for the `HELP` command. */
export interface HelpResponse extends DualStatusResponse {
	/** The help text (if applicable, `null` otherwise). */
	readonly helpText: string | null;
}
/** An object containing a definition retrieved from the DICT server. */
export interface DictDefinition {
	/** The word that was queried from the server. */
	readonly headword: string;
	/** The definition text for the word. */
	readonly definition: string;
	/** The name of the dictionary the definition came from. */
	readonly dictionary: string;
	/** The description of the dictionary the definition came from. */
	readonly dictionaryDescription: string;
}
/** An object representing some list of items from the DICT server. */
interface ListResponse extends DualStatusResponse {
	/** How many items were retrieved. */
	readonly count: number;
}
/** The response type for the `DEFINE` command. */
export interface DefineResponse extends ListResponse {
	/** An array of {@link DictDefinition} objects, one per each definition. */
	readonly definitions: DictDefinition[];
}
/** An entry in a match response. */
export interface MatchEntry {
	/** The name of the dictionary the match came from. */
	readonly dictionary: string;
	/** The matched word. */
	readonly word: string;
}
/** The response type for the `MATCH` command. */
export interface MatchResponse extends ListResponse {
	/** An array of {@link MatchEntry} objects, one per each match. */
	readonly matches: MatchEntry[];
}
export {};
