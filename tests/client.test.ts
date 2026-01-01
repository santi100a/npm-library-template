import DictClient from '../src';
jest.setTimeout(20_000);

describe('DictClient.client() method', () => {
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

	it('should throw errors for invalid or missing parameters', async () => {
		// @ts-expect-error: Wrong parameters test
		await expect(client.client(1)).rejects.toThrow();

		// @ts-expect-error: Wrong parameters test
		await expect(client.client(true)).rejects.toThrow();

		// @ts-expect-error: Wrong parameters test
		await expect(client.client(null)).rejects.toThrow();
	});

	it('should throw an error if not connected', async () => {
		await expect(client.client()).rejects.toThrow('Connection not established');
		await expect(client.client('jest')).rejects.toThrow(
			'Connection not established'
		);
	});

	it('should return a proper response', async () => {
		await client.connect(new URL('dict://dict.mova.org'));
		const response = await client.client('jest');
		expect(response.ok).toBe(true);
		expect(response.status).toBe(250);
		expect(typeof response.message).toBe('string');
	});
});
