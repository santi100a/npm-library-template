import DictClient from '../src';
jest.setTimeout(20_000);

describe('DictClient.quit() and DictClient.disconnect() methods', () => {
	let client: DictClient;

	beforeEach(() => {
		client = new DictClient();
	});

	afterEach(async () => {
		// Only disconnect if still connected
		if (client.connected) {
			try {
				await client.disconnect();
			} catch {
				// Ignore errors in cleanup
			}
		}
		// Wait a bit before next test to avoid port exhaustion
		await new Promise(resolve => setTimeout(resolve, 100));
	});

	it('DictClient.quit() should throw an error if not connected', async () => {
		await expect(client.quit()).rejects.toThrow('Connection not established');
	});

	it('DictClient.quit() should return a proper response', async () => {
		await client.connect(new URL('dict://dict.org'));
		const response = await client.quit();
		expect(response.ok).toBe(true);
		expect(response.status).toBe(221);
		expect(typeof response.message).toBe('string');
	});

	it('DictClient.disconnect() should quit if connected', async () => {
		await client.connect(new URL('dict://dict.org'));
		expect(client.connected).toBe(true);
		await client.disconnect();
		expect(client.connected).toBe(false);
	});
});
