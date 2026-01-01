import DictClient from '../src';
jest.setTimeout(20_000);

describe('DictClient.option() and DictClient.mime() methods', () => {
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
		await expect(client.option(1, true, [], {}, null)).rejects.toThrow();
	});

	it('should throw an error if not connected', async () => {
		await expect(client.option('MIME')).rejects.toThrow(
			'Connection not established'
		);
	});

	it('should return a response for an option', async () => {
		await client.connect(new URL('dict://dict.org'));
		const response = await client.option('FOO', 'BAR');
		expect(typeof response.ok).toBe('boolean');
		expect(typeof response.status).toBe('number');
		expect(typeof response.message).toBe('string');
	});

	it('should return a proper response for OPTION MIME', async () => {
		await client.connect(new URL('dict://dict.mova.org'));
		const response = await client.mime();
		expect(response.ok).toBe(true);
		expect(response.status).toBe(250);
		expect(typeof response.message).toBe('string');
	}, 20_000);
});
