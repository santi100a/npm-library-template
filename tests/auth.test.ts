import DictClient from '../src';
jest.setTimeout(20_000);

describe('DictClient.auth() method', () => {
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
		await expect(client.auth('username', 'password')).rejects.toThrow(
			'Connection not established'
		);
	});

	it('should throw errors for invalid or missing parameters', async () => {
		// @ts-expect-error: Wrong parameters test
		await expect(client.auth(1)).rejects.toThrow();

		// @ts-expect-error: Wrong parameters test
		await expect(client.auth(1, 2)).rejects.toThrow();
	});

	it('should return a proper response with URL credentials', async () => {
		await client.connect(new URL('dict://user:pass@dict.org'));
		const response = await client.auth();
		expect(typeof response.ok).toBe('boolean');
		expect(typeof response.status).toBe('number');
		expect(typeof response.message).toBe('string');
	});

	it('should return a proper response with explicit credentials', async () => {
		await client.connect(new URL('dict://user:pass@dict.mova.org'));
		const response = await client.auth('user', 'pass');
		expect(typeof response.ok).toBe('boolean');
		expect(typeof response.status).toBe('number');
		expect(typeof response.message).toBe('string');
	});
});
