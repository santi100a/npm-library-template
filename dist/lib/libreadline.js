"use strict";
exports.__esModule = true;
exports.createLineReader = void 0;
function createLineReader(socket) {
    var buffer = '';
    return function readLine() {
        return new Promise(function (resolve, reject) {
            // Check if we already have a complete line in buffer
            var newlineIndex = buffer.indexOf('\r\n');
            if (newlineIndex !== -1) {
                var line = buffer.slice(0, newlineIndex);
                buffer = buffer.slice(newlineIndex + 2); // Keep remaining data
                resolve(line);
                return;
            }
            var onData = function (data) {
                buffer += data.toString();
                var newlineIndex = buffer.indexOf('\r\n');
                if (newlineIndex !== -1) {
                    cleanup();
                    var line = buffer.slice(0, newlineIndex);
                    buffer = buffer.slice(newlineIndex + 2); // Keep remaining data
                    resolve(line);
                }
            };
            var onError = function (error) {
                cleanup();
                reject(error);
            };
            var onEnd = function () {
                cleanup();
                reject(new Error('Connection closed before receiving complete line'));
            };
            var cleanup = function () {
                socket.off('data', onData);
                socket.off('error', onError);
                socket.off('end', onEnd);
            };
            socket.on('data', onData);
            socket.once('error', onError);
            socket.once('end', onEnd);
        });
    };
}
exports.createLineReader = createLineReader;
