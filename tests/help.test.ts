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

	it('should throw an error if not connected', async () => {
		await expect(client.help()).rejects.toThrow('Connection not established');
	});

	it('should return a proper response', async () => {
		await client.connect(new URL('dict://dict.org'));
		const response = await client.help();
		expect(response.ok).toBe(true);
		expect(response.status).toBe(113);
		expect(typeof response.message).toBe('string');
		expect(typeof response.helpText).toBe('string');
		expect(response.finalStatus).not.toBeNull();
	});
});
