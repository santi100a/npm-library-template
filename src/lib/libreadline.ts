export function createLineReader(socket: import('node:net').Socket) {
	let buffer = '';

	return function readLine(): Promise<string> {
		return new Promise((resolve, reject) => {
			// Check if we already have a complete line in buffer
			const newlineIndex = buffer.indexOf('\r\n');
			if (newlineIndex !== -1) {
				const line = buffer.slice(0, newlineIndex);
				buffer = buffer.slice(newlineIndex + 2); // Keep remaining data
				resolve(line);
				return;
			}

			const onData = (data: Buffer) => {
				buffer += data.toString();

				const newlineIndex = buffer.indexOf('\r\n');
				if (newlineIndex !== -1) {
					cleanup();
					const line = buffer.slice(0, newlineIndex);
					buffer = buffer.slice(newlineIndex + 2); // Keep remaining data
					resolve(line);
				}
			};

			const onError = (error: Error) => {
				cleanup();
				reject(error);
			};

			const onEnd = () => {
				cleanup();
				reject(new Error('Connection closed before receiving complete line'));
			};

			const cleanup = () => {
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
