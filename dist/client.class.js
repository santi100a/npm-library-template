"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var node_crypto_1 = require("node:crypto");
var node_net_1 = require("node:net");
var assertion_lib_1 = require("@santi100a/assertion-lib");
var libreadline_1 = require("./lib/libreadline");
var assertEqual = require("@santi100a/assertion-lib/cjs/equal");
var DictClient = /** @class */ (function () {
    function DictClient(url, port) {
        if (url === void 0) { url = new URL('dict://'); }
        if (port === void 0) { port = 2628; }
        // Properties
        /**
         * The URL for the DICT server, passed either in the constructor or in the {@link DictClient.connect()} method.
         */
        this.url = new URL('dict://');
        /**
         * Whether or not the client is connected to a server right now.
         */
        this.connected = false;
        /**
         * An error object in case something went wrong, `null` otherwise.
         */
        this.connectionError = null;
        /**
         * Stores server capabilities after connection is established.
         */
        this.capabilities = [];
        /**
         * Stores message ID after connection is established.
         */
        this.messageId = '';
        this.__client = new node_net_1.Socket();
        this.__readLine = (0, libreadline_1.createLineReader)(this.__client);
        var urlText = typeof url === 'string' && !url.startsWith('dict://')
            ? 'dict://'.concat(url)
            : url;
        this.url = url instanceof URL ? url : new URL(urlText);
        if (this.url.port === '')
            this.url.port = String(port);
        if (this.url.protocol === '')
            this.url.protocol = 'dict:';
        assertEqual(this.url.protocol, 'dict:', 'url.protocol');
    }
    DictClient.prototype.connect = function (url) {
        if (url === void 0) { url = this.url; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (url !== this.url) {
                    this.disconnect();
                    this.url = url;
                }
                if (this.url.port === '')
                    this.url.port = '2628';
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.__client.connect({
                            host: url.hostname,
                            port: Number(url.port)
                        });
                        _this.__client.once('connect', function () { return __awaiter(_this, void 0, void 0, function () {
                            var rawLine, statusMatch, statusCode, rest, ok, capMatch, capabilities, msgIdMatch, messageId, message, error_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, this.__readLine()];
                                    case 1:
                                        rawLine = _a.sent();
                                        statusMatch = /^(\d{3})\s+(.+)$/.exec(rawLine);
                                        if (!statusMatch) {
                                            reject(new Error('Invalid DICT greeting format'));
                                            return [2 /*return*/];
                                        }
                                        statusCode = statusMatch[1], rest = statusMatch[2];
                                        ok = statusCode === '220';
                                        if (!ok)
                                            reject(new Error("Connection failed: ".concat(rawLine)));
                                        capMatch = /<([^>]+)>/.exec(rest);
                                        capabilities = capMatch ? capMatch[1].split('.') : [];
                                        msgIdMatch = /<([^>]+)>\s*$/.exec(rest);
                                        messageId = msgIdMatch ? msgIdMatch[1] : '';
                                        message = rest.replace(/<[^>]+>/g, '').trim();
                                        this.messageId = messageId;
                                        this.capabilities = capabilities;
                                        this.connected = true;
                                        resolve({
                                            status: Number(statusCode),
                                            ok: ok,
                                            message: message,
                                            capabilities: capabilities,
                                            messageId: messageId
                                        });
                                        return [3 /*break*/, 3];
                                    case 2:
                                        error_1 = _a.sent();
                                        reject(error_1);
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); });
                        _this.__client.once('error', function (error) {
                            reject(error);
                        });
                        _this.__client.on('close', function () {
                            _this.connected = false;
                        });
                    })];
            });
        });
    };
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
    DictClient.prototype.define = function (dictionary, headword) {
        return __awaiter(this, void 0, void 0, function () {
            var safeDictionary, safeHeadword, quotedHeadword, statusLine, statusMatch, _a, statusCode, message, ok, countMatch, count, definitions, i, defStatusLine, defMatch, headwordFromServer, dictionaryName, dictionaryDescription, definitionLines, rawLine, finalStatusLine, finalStatusMatch, _b, finalStatusCode, finalStatusMessage;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        (0, assertion_lib_1.assertTypeOf)(dictionary, 'string', 'dictionary');
                        (0, assertion_lib_1.assertTypeOf)(headword, 'string', 'headword');
                        if (!this.connected) {
                            throw new Error('Connection not established');
                        }
                        if (this.connectionError) {
                            throw new Error('Connection error occurred');
                        }
                        safeDictionary = this.__sanitize(dictionary);
                        safeHeadword = this.__sanitize(headword);
                        quotedHeadword = safeHeadword.includes(' ')
                            ? "\"".concat(safeHeadword, "\"")
                            : safeHeadword;
                        this.__client.write("DEFINE ".concat(safeDictionary, " ").concat(quotedHeadword, "\r\n"));
                        return [4 /*yield*/, this.__readLine()];
                    case 1:
                        statusLine = _c.sent();
                        statusMatch = /^(\d{3})\s+(.+)$/.exec(statusLine);
                        _a = statusMatch !== null && statusMatch !== void 0 ? statusMatch : [], statusCode = _a[1], message = _a[2];
                        ok = statusCode === '150';
                        if (!ok) {
                            // No definitions found (e.g., 552 no match)
                            return [2 /*return*/, {
                                    status: Number(statusCode),
                                    ok: ok,
                                    message: message,
                                    count: 0,
                                    definitions: [],
                                    finalStatus: null
                                }];
                        }
                        countMatch = /^(\d+)/.exec(message);
                        count = countMatch ? Number(countMatch[1]) : 0;
                        definitions = [];
                        i = 0;
                        _c.label = 2;
                    case 2:
                        if (!(i < count)) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.__readLine()];
                    case 3:
                        defStatusLine = _c.sent();
                        defMatch = /^151\s+"([^"]+)"\s+(\S+)\s+"([^"]+)"/.exec(defStatusLine);
                        if (!defMatch) {
                            throw new Error("Invalid definition header: ".concat(defStatusLine));
                        }
                        headwordFromServer = defMatch[1], dictionaryName = defMatch[2], dictionaryDescription = defMatch[3];
                        definitionLines = [];
                        _c.label = 4;
                    case 4:
                        if (!true) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.__readLine()];
                    case 5:
                        rawLine = _c.sent();
                        if (rawLine === '.') {
                            return [3 /*break*/, 6];
                        }
                        definitionLines.push(rawLine);
                        return [3 /*break*/, 4];
                    case 6:
                        definitions.push({
                            headword: headwordFromServer,
                            dictionary: dictionaryName,
                            dictionaryDescription: dictionaryDescription,
                            definition: definitionLines.join('\n')
                        });
                        _c.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 2];
                    case 8: return [4 /*yield*/, this.__readLine()];
                    case 9:
                        finalStatusLine = _c.sent();
                        finalStatusMatch = /^(\d{3})\s+(.+)$/.exec(finalStatusLine);
                        _b = finalStatusMatch !== null && finalStatusMatch !== void 0 ? finalStatusMatch : [], finalStatusCode = _b[1], finalStatusMessage = _b[2];
                        return [2 /*return*/, {
                                status: Number(statusCode),
                                ok: ok,
                                message: message,
                                count: count,
                                definitions: definitions,
                                finalStatus: {
                                    status: Number(finalStatusCode),
                                    ok: Number(finalStatusCode) === 250,
                                    message: finalStatusMessage
                                }
                            }];
                }
            });
        });
    };
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
    DictClient.prototype.match = function (dictionary, strategy, headword) {
        return __awaiter(this, void 0, void 0, function () {
            var safeDictionary, safeStrategy, safeHeadword, quotedHeadword, statusLine, statusMatch, _a, statusCode, message, ok, matches, rawLine, dbMatch, dictionary_1, word, finalStatusLine, _b, finalStatusCode, finalStatusMessage;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        (0, assertion_lib_1.assertTypeOf)(dictionary, 'string', 'dictionary');
                        (0, assertion_lib_1.assertTypeOf)(strategy, 'string', 'strategy');
                        (0, assertion_lib_1.assertTypeOf)(headword, 'string', 'headword');
                        if (!this.connected) {
                            throw new Error('Connection not established');
                        }
                        if (this.connectionError) {
                            throw new Error('Connection error occurred');
                        }
                        safeDictionary = this.__sanitize(dictionary);
                        safeStrategy = this.__sanitize(strategy);
                        safeHeadword = this.__sanitize(headword);
                        quotedHeadword = safeHeadword.includes(' ')
                            ? "\"".concat(safeHeadword, "\"")
                            : safeHeadword;
                        this.__client.write("MATCH ".concat(safeDictionary, " ").concat(safeStrategy, " ").concat(quotedHeadword, "\r\n"));
                        return [4 /*yield*/, this.__readLine()];
                    case 1:
                        statusLine = _c.sent();
                        statusMatch = /^(\d{3})\s+(.+)$/.exec(statusLine);
                        _a = statusMatch !== null && statusMatch !== void 0 ? statusMatch : [], statusCode = _a[1], message = _a[2];
                        ok = statusCode === '152';
                        matches = [];
                        if (!ok)
                            return [2 /*return*/, {
                                    status: Number(statusCode),
                                    ok: ok,
                                    message: message,
                                    matches: matches,
                                    count: 0,
                                    finalStatus: null
                                }];
                        _c.label = 2;
                    case 2:
                        if (!true) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.__readLine()];
                    case 3:
                        rawLine = _c.sent();
                        // End of list marker
                        if (rawLine === '.') {
                            return [3 /*break*/, 4];
                        }
                        dbMatch = /^(\S+)\s+"(.+)"$/.exec(rawLine);
                        if (dbMatch) {
                            dictionary_1 = dbMatch[1], word = dbMatch[2];
                            matches.push({ dictionary: dictionary_1, word: word });
                        }
                        return [3 /*break*/, 2];
                    case 4: return [4 /*yield*/, this.__readLine()];
                    case 5:
                        finalStatusLine = _c.sent();
                        _b = finalStatusLine.split(' '), finalStatusCode = _b[0], finalStatusMessage = _b[1];
                        return [2 /*return*/, {
                                status: Number(statusCode),
                                ok: ok,
                                count: matches.length,
                                message: message,
                                matches: matches,
                                finalStatus: {
                                    status: Number(finalStatusCode),
                                    ok: Number(finalStatusCode) === 250,
                                    message: finalStatusMessage
                                }
                            }];
                }
            });
        });
    };
    /**
     * Returns a list of databases (dictionaries) available on the server.
     *
     * @returns A promise that resolves to an {@link DatabaseResponse} object containing all available databases.
     * @throws If something is wrong with the connection or the response is unexpected.
     */
    DictClient.prototype.showDatabases = function () {
        return __awaiter(this, void 0, void 0, function () {
            var statusLine, statusMatch, _a, statusCode, message, ok, databases, rawLine, dbMatch, name_1, description, finalStatusLine, _b, finalStatusCode, finalStatusMessage;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.connected) {
                            throw new Error('Connection not established');
                        }
                        if (this.connectionError) {
                            throw new Error('Connection error occurred');
                        }
                        this.__client.write('SHOW DATABASES\r\n');
                        return [4 /*yield*/, this.__readLine()];
                    case 1:
                        statusLine = _c.sent();
                        statusMatch = /^(\d{3})\s+(.+)$/.exec(statusLine);
                        _a = statusMatch !== null && statusMatch !== void 0 ? statusMatch : [], statusCode = _a[1], message = _a[2];
                        ok = statusCode === '110';
                        if (!ok) {
                            throw new Error("Unexpected response: ".concat(statusLine));
                        }
                        databases = [];
                        _c.label = 2;
                    case 2:
                        if (!true) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.__readLine()];
                    case 3:
                        rawLine = _c.sent();
                        // End of list marker
                        if (rawLine === '.') {
                            return [3 /*break*/, 4];
                        }
                        dbMatch = /^(\S+)\s+"(.+)"$/.exec(rawLine);
                        if (dbMatch) {
                            name_1 = dbMatch[1], description = dbMatch[2];
                            databases.push({ name: name_1, description: description });
                        }
                        return [3 /*break*/, 2];
                    case 4: return [4 /*yield*/, this.__readLine()];
                    case 5:
                        finalStatusLine = _c.sent();
                        _b = finalStatusLine.split(' '), finalStatusCode = _b[0], finalStatusMessage = _b[1];
                        return [2 /*return*/, {
                                status: Number(statusCode),
                                ok: ok,
                                message: message,
                                databases: databases,
                                finalStatus: {
                                    status: Number(finalStatusCode),
                                    ok: Number(finalStatusCode) === 250,
                                    message: finalStatusMessage
                                }
                            }];
                }
            });
        });
    };
    /**
     * Returns a list of valid strategies available on the server to use with the `MATCH` command.
     *
     * @returns A promise that resolves to a {@link StrategiesResponse} object containing all available match strategies.
     * @throws If something is wrong with the connection or the response is unexpected.
     */
    DictClient.prototype.showStrategies = function () {
        return __awaiter(this, void 0, void 0, function () {
            var statusLine, statusMatch, _a, statusCode, message, ok, strategies, rawLine, dbMatch, name_2, description, finalStatusLine, _b, finalStatusCode, finalStatusMessage;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.connected) {
                            throw new Error('Connection not established');
                        }
                        if (this.connectionError) {
                            throw new Error('Connection error occurred');
                        }
                        this.__client.write('SHOW STRATEGIES\r\n');
                        return [4 /*yield*/, this.__readLine()];
                    case 1:
                        statusLine = _c.sent();
                        statusMatch = /^(\d{3})\s+(.+)$/.exec(statusLine);
                        _a = statusMatch !== null && statusMatch !== void 0 ? statusMatch : [], statusCode = _a[1], message = _a[2];
                        ok = statusCode === '111';
                        if (!ok) {
                            throw new Error("Unexpected response: ".concat(statusLine));
                        }
                        strategies = [];
                        _c.label = 2;
                    case 2:
                        if (!true) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.__readLine()];
                    case 3:
                        rawLine = _c.sent();
                        // End of list marker
                        if (rawLine === '.') {
                            return [3 /*break*/, 4];
                        }
                        dbMatch = /^(\S+)\s+"(.+)"$/.exec(rawLine);
                        if (dbMatch) {
                            name_2 = dbMatch[1], description = dbMatch[2];
                            strategies.push({ name: name_2, description: description });
                        }
                        return [3 /*break*/, 2];
                    case 4: return [4 /*yield*/, this.__readLine()];
                    case 5:
                        finalStatusLine = _c.sent();
                        _b = finalStatusLine.split(' '), finalStatusCode = _b[0], finalStatusMessage = _b[1];
                        return [2 /*return*/, {
                                status: Number(statusCode),
                                ok: ok,
                                message: message,
                                strategies: strategies,
                                finalStatus: {
                                    status: Number(finalStatusCode),
                                    ok: Number(finalStatusCode) === 250,
                                    message: finalStatusMessage
                                }
                            }];
                }
            });
        });
    };
    /**
     * Retrieves information about a specific database (i.e. dictionary).
     *
     * @param {string} dictionary - The database to get information about.
     * @returns A promise that resolves to an {@link InfoResponse} object containing information about a database.
     * @throws If something is wrong with the connection or the response is unexpected.
     */
    DictClient.prototype.showInfo = function (dictionary) {
        return __awaiter(this, void 0, void 0, function () {
            var statusLine, statusMatch, _a, statusCode, message, lines, ok, rawLine, finalStatusLine, _b, finalStatusCode, finalStatusMessage;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        (0, assertion_lib_1.assertTypeOf)(dictionary, 'string', 'dictionary');
                        if (!this.connected) {
                            throw new Error('Connection not established');
                        }
                        if (this.connectionError) {
                            throw new Error('Connection error occurred');
                        }
                        this.__client.write("SHOW INFO ".concat(this.__sanitize(dictionary), "\r\n"));
                        return [4 /*yield*/, this.__readLine()];
                    case 1:
                        statusLine = _c.sent();
                        statusMatch = /^(\d{3})\s+(.+)$/.exec(statusLine);
                        _a = statusMatch !== null && statusMatch !== void 0 ? statusMatch : [], statusCode = _a[1], message = _a[2];
                        lines = [];
                        ok = statusCode === '112';
                        if (!ok) {
                            return [2 /*return*/, {
                                    status: Number(statusCode),
                                    ok: ok,
                                    message: message,
                                    info: null,
                                    finalStatus: null
                                }];
                        }
                        _c.label = 2;
                    case 2:
                        if (!true) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.__readLine()];
                    case 3:
                        rawLine = _c.sent();
                        // End of list marker
                        if (rawLine === '.') {
                            return [3 /*break*/, 4];
                        }
                        lines.push(rawLine);
                        return [3 /*break*/, 2];
                    case 4: return [4 /*yield*/, this.__readLine()];
                    case 5:
                        finalStatusLine = _c.sent();
                        _b = finalStatusLine.split(' '), finalStatusCode = _b[0], finalStatusMessage = _b[1];
                        return [2 /*return*/, {
                                status: Number(statusCode),
                                ok: ok,
                                message: message,
                                info: lines.join('\n'),
                                finalStatus: {
                                    status: Number(finalStatusCode),
                                    ok: Number(finalStatusCode) === 250,
                                    message: finalStatusMessage
                                }
                            }];
                }
            });
        });
    };
    /**
     * Retrieves information about the server.
     *
     * @returns A promise that resolves to an {@link InfoResponse} object containing information about the current server.
     * @throws If something is wrong with the connection or the response is unexpected.
     */
    DictClient.prototype.showServer = function () {
        return __awaiter(this, void 0, void 0, function () {
            var statusLine, statusMatch, _a, statusCode, message, lines, ok, rawLine, finalStatusLine, _b, finalStatusCode, finalStatusMessage;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.connected) {
                            throw new Error('Connection not established');
                        }
                        if (this.connectionError) {
                            throw new Error('Connection error occurred');
                        }
                        this.__client.write('SHOW SERVER\r\n');
                        return [4 /*yield*/, this.__readLine()];
                    case 1:
                        statusLine = _c.sent();
                        statusMatch = /^(\d{3})\s+(.+)$/.exec(statusLine);
                        _a = statusMatch !== null && statusMatch !== void 0 ? statusMatch : [], statusCode = _a[1], message = _a[2];
                        lines = [];
                        ok = statusCode === '114';
                        if (!ok) {
                            throw new Error("Unexpected response: ".concat(statusLine));
                        }
                        _c.label = 2;
                    case 2:
                        if (!true) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.__readLine()];
                    case 3:
                        rawLine = _c.sent();
                        // End of list marker
                        if (rawLine === '.') {
                            return [3 /*break*/, 4];
                        }
                        lines.push(rawLine);
                        return [3 /*break*/, 2];
                    case 4: return [4 /*yield*/, this.__readLine()];
                    case 5:
                        finalStatusLine = _c.sent();
                        _b = finalStatusLine.split(' '), finalStatusCode = _b[0], finalStatusMessage = _b[1];
                        return [2 /*return*/, {
                                status: Number(statusCode),
                                ok: ok,
                                message: message,
                                info: lines.join('\n'),
                                finalStatus: {
                                    status: Number(finalStatusCode),
                                    ok: Number(finalStatusCode) === 250,
                                    message: finalStatusMessage
                                }
                            }];
                }
            });
        });
    };
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
    DictClient.prototype.option = function () {
        var options = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            options[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var cleanOptions, rawLine, statusMatch, statusCode, rest, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.connected) {
                            throw new Error('Connection not established');
                        }
                        if (this.connectionError) {
                            throw new Error('Connection error occurred');
                        }
                        cleanOptions = options.map(this.__sanitize);
                        this.__client.write("OPTION ".concat(cleanOptions.join(' '), "\r\n"));
                        return [4 /*yield*/, this.__readLine()];
                    case 1:
                        rawLine = _a.sent();
                        statusMatch = /^(\d{3})\s+(.+)$/.exec(rawLine);
                        if (!statusMatch) {
                            throw new Error('Invalid DICT status format');
                        }
                        statusCode = statusMatch[1], rest = statusMatch[2];
                        message = rest.trim();
                        return [2 /*return*/, {
                                status: Number(statusCode),
                                ok: Number(statusCode) === 250,
                                message: message
                            }];
                }
            });
        });
    };
    DictClient.prototype.client = function (userAgent) {
        if (userAgent === void 0) { userAgent = ''; }
        return __awaiter(this, void 0, void 0, function () {
            var cleanUserAgent, rawLine, clientMatch, statusCode, rest, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, assertion_lib_1.assertTypeOf)(userAgent, 'string', 'userAgent');
                        if (!this.connected) {
                            throw new Error('Connection not established');
                        }
                        if (this.connectionError)
                            throw new Error('Connection error occurred');
                        cleanUserAgent = this.__sanitize(userAgent);
                        this.__client.write("CLIENT ".concat(cleanUserAgent !== null && cleanUserAgent !== void 0 ? cleanUserAgent : '', "\r\n"));
                        return [4 /*yield*/, this.__readLine()];
                    case 1:
                        rawLine = _a.sent();
                        clientMatch = /^(\d{3})\s+(.+)$/.exec(rawLine);
                        if (!clientMatch) {
                            throw new Error('Invalid DICT CLIENT response format');
                        }
                        statusCode = clientMatch[1], rest = clientMatch[2];
                        message = rest.trim();
                        return [2 /*return*/, {
                                status: Number(statusCode),
                                ok: Number(statusCode) === 250,
                                message: message
                            }];
                }
            });
        });
    };
    DictClient.prototype.auth = function (username, password) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var cleanUsername, cleanPassword, rawLine, authMatch, statusCode, rest, message;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.connected)
                            throw new Error('Connection not established');
                        if (this.connectionError)
                            throw new Error('Connection error occurred');
                        cleanUsername = this.__sanitize((_a = username !== null && username !== void 0 ? username : this.url.username) !== null && _a !== void 0 ? _a : '');
                        cleanPassword = this.__sanitize((_b = password !== null && password !== void 0 ? password : this.url.password) !== null && _b !== void 0 ? _b : '');
                        this.__client.write(
                        // Hash format: MD5(<messageId>authString) per RFC 2229
                        "AUTH ".concat(cleanUsername, " ").concat((0, node_crypto_1.createHash)('md5')
                            .update('<'.concat(this.messageId, '>', cleanPassword))
                            .digest('hex'), "\r\n"));
                        return [4 /*yield*/, this.__readLine()];
                    case 1:
                        rawLine = _c.sent();
                        authMatch = /^(\d{3})\s+(.+)$/.exec(rawLine);
                        if (!authMatch) {
                            throw new Error('Invalid DICT AUTH response format');
                        }
                        statusCode = authMatch[1], rest = authMatch[2];
                        message = rest.trim();
                        return [2 /*return*/, {
                                status: Number(statusCode),
                                ok: Number(statusCode) === 230,
                                message: message
                            }];
                }
            });
        });
    };
    /**
     * Requests status information from the server.
     *
     * @returns A promise that resolves to a {@link DictResponse} object containing server status information.
     * @throws If something is wrong with the connection or the response format.
     */
    DictClient.prototype.status = function () {
        return __awaiter(this, void 0, void 0, function () {
            var rawLine, statusMatch, statusCode, rest, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.connected) {
                            throw new Error('Connection not established');
                        }
                        if (this.connectionError) {
                            throw new Error('Connection error occurred');
                        }
                        this.__client.write('STATUS\r\n');
                        return [4 /*yield*/, this.__readLine()];
                    case 1:
                        rawLine = _a.sent();
                        statusMatch = /^(\d{3})\s+(.+)$/.exec(rawLine);
                        if (!statusMatch) {
                            throw new Error('Invalid DICT status format');
                        }
                        statusCode = statusMatch[1], rest = statusMatch[2];
                        message = rest.trim();
                        return [2 /*return*/, {
                                status: Number(statusCode),
                                ok: Number(statusCode) === 210,
                                message: message
                            }];
                }
            });
        });
    };
    /**
     * Retrieves help information from the server.
     *
     * @returns A promise that resolves to a {@link HelpResponse} containing help text from the server.
     * @throws If something is wrong with the connection or the response is unexpected.
     */
    DictClient.prototype.help = function () {
        return __awaiter(this, void 0, void 0, function () {
            var statusLine, statusMatch, _a, statusCode, message, lines, ok, rawLine, finalStatusLine, _b, finalStatusCode, finalStatusMessage;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.connected) {
                            throw new Error('Connection not established');
                        }
                        if (this.connectionError) {
                            throw new Error('Connection error occurred');
                        }
                        this.__client.write("HELP\r\n");
                        return [4 /*yield*/, this.__readLine()];
                    case 1:
                        statusLine = _c.sent();
                        statusMatch = /^(\d{3})\s+(.+)$/.exec(statusLine);
                        _a = statusMatch !== null && statusMatch !== void 0 ? statusMatch : [], statusCode = _a[1], message = _a[2];
                        lines = [];
                        ok = statusCode === '113';
                        if (!ok)
                            throw new Error("Unexpected response: ".concat(statusLine));
                        _c.label = 2;
                    case 2:
                        if (!true) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.__readLine()];
                    case 3:
                        rawLine = _c.sent();
                        // End of list marker
                        if (rawLine === '.') {
                            return [3 /*break*/, 4];
                        }
                        lines.push(rawLine);
                        return [3 /*break*/, 2];
                    case 4: return [4 /*yield*/, this.__readLine()];
                    case 5:
                        finalStatusLine = _c.sent();
                        _b = finalStatusLine.split(' '), finalStatusCode = _b[0], finalStatusMessage = _b[1];
                        return [2 /*return*/, {
                                status: Number(statusCode),
                                ok: ok,
                                message: message,
                                helpText: lines.join('\n'),
                                finalStatus: {
                                    status: Number(finalStatusCode),
                                    ok: Number(finalStatusCode) === 250,
                                    message: finalStatusMessage
                                }
                            }];
                }
            });
        });
    };
    /**
     * Sends the `QUIT` command to the server and disconnects.
     * @returns A promise that resolves to a {@link DictResponse} object containing the server's response.
     * @throws If something is wrong with the connection or the response format.
     */
    DictClient.prototype.quit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var rawLine, statusMatch, statusCode, rest, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.connected) {
                            throw new Error('Connection not established');
                        }
                        if (this.connectionError) {
                            throw new Error('Connection error occurred');
                        }
                        this.__client.write("QUIT\r\n");
                        return [4 /*yield*/, this.__readLine()];
                    case 1:
                        rawLine = _a.sent();
                        statusMatch = /^(\d{3})\s+(.+)$/.exec(rawLine);
                        if (!statusMatch) {
                            throw new Error('Invalid DICT status format');
                        }
                        statusCode = statusMatch[1], rest = statusMatch[2];
                        message = rest.trim();
                        this.connectionError = null;
                        // Set connected to false BEFORE ending the socket
                        this.connected = false;
                        try {
                            this.__client.end();
                        }
                        catch (error) {
                            this.connectionError =
                                error instanceof Error ? error : new Error(String(error));
                        }
                        return [2 /*return*/, {
                                status: Number(statusCode),
                                ok: Number(statusCode) === 221,
                                message: message
                            }];
                }
            });
        });
    };
    // Other functions
    /**
     * Enables MIME support on the server, if available. Alias for `client.option('MIME')`.
     *
     * @see {@link DictClient.option()}
     */
    DictClient.prototype.mime = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.option('MIME')];
            });
        });
    };
    /**
     * Disconnects from a server if connected, does nothing otherwise.
     *
     * @see {@link DictClient.quit()}
     */
    DictClient.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.connected)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.quit()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Private members
    /**
     * Sanitizes user input to prevent command injection via CRLF sequences
     * @private - Not for use outside
     */
    DictClient.prototype.__sanitize = function (input) {
        // Remove CR and LF characters
        return input.replace(/[\r\n]/g, '');
    };
    return DictClient;
}());
exports["default"] = DictClient;
