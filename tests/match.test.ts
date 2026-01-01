import DictClient from '../src';
jest.setTimeout(20_000);

describe('DictClient.match() method', () => {
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
		// @ts-expect-error: Missing parameters test
		await expect(client.match()).rejects.toThrow();
		// @ts-expect-error: Missing parameters test
		await expect(client.match('gcide')).rejects.toThrow();
		// @ts-expect-error: Missing parameters test
		await expect(client.match('gcide', 'soundex')).rejects.toThrow();
		// @ts-expect-error: Wrong parameters test
		await expect(client.match(1)).rejects.toThrow();
		// @ts-expect-error: Wrong parameters test
		await expect(client.match(false, 'word')).rejects.toThrow();
		// @ts-expect-error: Wrong parameters test
		await expect(client.match(false, 'word', null)).rejects.toThrow();
	});

	it('should throw an error if not connected', async () => {
		await expect(client.match('gcide', 'lev', 'engine')).rejects.toThrow(
			'Connection not established'
		);
	});

	it('should return an error for a nonexistent word', async () => {
		await client.connect(new URL('dict://dict.org'));
		const response = await client.match('gcide', 'exact', 'asdf');
		expect(response.ok).toBe(false);
		expect(response.status).toBe(552);
		expect(response.matches.length).toBe(0);
	});

	it('should return a proper response for a correct word', async () => {
		await client.connect(new URL('dict://dict.mova.org'));
		const response = await client.match('muiswerk', 'lev', 'vandaag');
		expect(response.ok).toBe(true);
		expect(response.status).toBe(152);
		expect(response.matches.length).toBeGreaterThan(0);
		expect(response.matches[0]).toHaveProperty('dictionary', 'muiswerk');
		expect(response.matches[0]).toHaveProperty('word', 'vandaag');
	});
});
