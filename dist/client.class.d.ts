import type { DefineResponse, DatabaseResponse, GreetingResponse, DictResponse, InfoResponse, MatchResponse, StrategiesResponse, HelpResponse } from './types';
export default class DictClient {
    /**
     * The URL for the DICT server, passed either in the constructor or in the {@link DictClient.connect()} method.
     */
    url: URL;
    /**
     * Whether or not the client is connected to a server right now.
     */
    connected: boolean;
    /**
     * An error object in case something went wrong, `null` otherwise.
     */
    connectionError: Error | null;
    /**
     * Stores server capabilities after connection is established.
     */
    capabilities: string[];
    /**
     * Stores message ID after connection is established.
     */
    messageId: string;
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
    /**
     * Connects to the DICT server specified in the constructor. Must be called before any other method.
     * Accepts greeting banners with or without capabilities and/or message ID.
     *
     * @returns A promise that resolves to a {@link GreetingResponse} object, containing server greeting information.
     * @throws If something goes wrong with the connection, the server returns an error, or the greeting format is invalid.
     */
    connect(): Promise<GreetingResponse>;
    /**
     * Connects to a DICT server, or disconnects from the current DICT server and connects to another.
     * Must be called before any other method. Accepts greeting banners with or without capabilities and/or message ID.
     *
     * @param {URL} url - A URL object representing the DICT server address. Must have protocol `dict://`.
     * @returns A promise that resolves to a {@link GreetingResponse} object, containing server greeting information.
     * @throws If something goes wrong with the connection, the server returns an error, or the greeting format is invalid.
     */
    connect(url: URL): Promise<GreetingResponse>;
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
    define(dictionary: string, headword: string): Promise<DefineResponse>;
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
    match(dictionary: string, strategy: string, headword: string): Promise<MatchResponse>;
    /**
     * Returns a list of databases (dictionaries) available on the server.
     *
     * @returns A promise that resolves to an {@link DatabaseResponse} object containing all available databases.
     * @throws If something is wrong with the connection or the response is unexpected.
     */
    showDatabases(): Promise<DatabaseResponse>;
    /**
     * Returns a list of valid strategies available on the server to use with the `MATCH` command.
     *
     * @returns A promise that resolves to a {@link StrategiesResponse} object containing all available match strategies.
     * @throws If something is wrong with the connection or the response is unexpected.
     */
    showStrategies(): Promise<StrategiesResponse>;
    /**
     * Retrieves information about a specific database (i.e. dictionary).
     *
     * @param {string} dictionary - The database to get information about.
     * @returns A promise that resolves to an {@link InfoResponse} object containing information about a database.
     * @throws If something is wrong with the connection or the response is unexpected.
     */
    showInfo(dictionary: string): Promise<InfoResponse>;
    /**
     * Retrieves information about the server.
     *
     * @returns A promise that resolves to an {@link InfoResponse} object containing information about the current server.
     * @throws If something is wrong with the connection or the response is unexpected.
     */
    showServer(): Promise<InfoResponse>;
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
    option(...options: string[]): Promise<DictResponse>;
    /**
     * Sends the `CLIENT` command to the server.
     *
     * @returns A promise that resolves to a `DictResponse` object containing the server's response.
     * @throws If something is wrong with the connection or the response format.
     */
    client(): Promise<DictResponse>;
    /**
     * Identifies the client before the server.
     *
     * @param userAgent - The client string to be sent to the server.
     * @returns A promise that resolves to a `DictResponse` object containing the server's response.
     * @throws If something is wrong with the connection or the response format.
     */
    client(userAgent: string): Promise<DictResponse>;
    /**
     * Authenticates before the server using APOP auth (i.e. the MD5 hash of (the message ID + the password)).
     *
     * @param username - The username for the server.
     * @param password - The password for the server.
     * @returns A promise that resolves to a `DictResponse` object containing the server's response
     * (e.g.: 230 OK, 531 auth error, 502 unsupported).
     * @throws If something is wrong with the connection or the response format.
     */
    auth(): Promise<DictResponse>;
    /**
     * Authenticates before the server using APOP auth (i.e. the MD5 hash of (the message ID + the password)).
     *
     * @param username - The username for the server.
     * @param password - The password for the server.
     * @returns A promise that resolves to a `DictResponse` object containing the server's response
     * (e.g.: 230 OK, 531 auth error, 502 unsupported).
     * @throws If something is wrong with the connection or the response format.
     */
    auth(username: string, password: string): Promise<DictResponse>;
    /**
     * Requests status information from the server.
     *
     * @returns A promise that resolves to a {@link DictResponse} object containing server status information.
     * @throws If something is wrong with the connection or the response format.
     */
    status(): Promise<DictResponse>;
    /**
     * Retrieves help information from the server.
     *
     * @returns A promise that resolves to a {@link HelpResponse} containing help text from the server.
     * @throws If something is wrong with the connection or the response is unexpected.
     */
    help(): Promise<HelpResponse>;
    /**
     * Sends the `QUIT` command to the server and disconnects.
     * @returns A promise that resolves to a {@link DictResponse} object containing the server's response.
     * @throws If something is wrong with the connection or the response format.
     */
    quit(): Promise<DictResponse>;
    /**
     * Enables MIME support on the server, if available. Alias for `client.option('MIME')`.
     *
     * @see {@link DictClient.option()}
     */
    mime(): Promise<DictResponse>;
    /**
     * Disconnects from a server if connected, does nothing otherwise.
     *
     * @see {@link DictClient.quit()}
     */
    disconnect(): Promise<void>;
    /**
     * Sanitizes user input to prevent command injection via CRLF sequences
     * @private - Not for use outside
     */
    private __sanitize;
    /**
     * Socket for connection
     * @private - Not for use outside
     */
    private readonly __client;
    /**
     * Reads lines asynchronously from the socket
     * @private - Not for use outside
     */
    private readonly __readLine;
}
