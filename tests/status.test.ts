import DictClient from '../src';
jest.setTimeout(20_000);

describe('DictClient.status() method', () => {
	let client: DictClient;

	beforeEach(() => {
		client = new DictClient();
	});

	afterEach(async () => {
		if (client.connected) {
			await client.disconnect();
		}
		// Wait a bit before next test to avoid port exhaustion
		await new Promise(resolve => setTimeout(resolve, 100));
	});

	it('should throw an error if not connected', async () => {
		await expect(client.status()).rejects.toThrow('Connection not established');
	});

	it('should return a proper response', async () => {
		await client.connect(new URL('dict://dict.org'));
		const response = await client.status();
		expect(typeof response.ok).toBe('boolean');
		expect(typeof response.status).toBe('number');
		expect(typeof response.message).toBe('string');
	});
});
