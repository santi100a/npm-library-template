import DictClient from '../src';
jest.setTimeout(20_000);

describe('DictClient.showDatabases() method', () => {
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
		await expect(client.showDatabases()).rejects.toThrow(
			'Connection not established'
		);
	});

	it('should return a proper response', async () => {
		await client.connect(new URL('dict://dict.mova.org'));
		const response = await client.showDatabases();
		expect(response.ok).toBe(true);
		expect(response.status).toBe(110);
		expect(response.message).toBeDefined();
		expect(response.databases.length).toBeGreaterThan(0);
		expect(response.databases[0]).toHaveProperty('name');
		expect(response.databases[0]).toHaveProperty('description');
		expect(response.finalStatus).not.toBeNull();
	});
});
describe('DictClient.showStrategies() method', () => {
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
		await expect(client.showStrategies()).rejects.toThrow(
			'Connection not established'
		);
	});

	it('should return a proper response', async () => {
		await client.connect(new URL('dict://dict.mova.org'));
		const response = await client.showStrategies();
		expect(response.ok).toBe(true);
		expect(response.status).toBe(111);
		expect(response.message).toBeDefined();
		expect(response.strategies.length).toBeGreaterThan(0);
		expect(response.strategies[0]).toHaveProperty('name');
		expect(response.strategies[0]).toHaveProperty('description');
		expect(response.finalStatus).not.toBeNull();
	});
});
describe('DictClient.showInfo() method', () => {
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
		await expect(client.showInfo()).rejects.toThrow();
		// @ts-expect-error: Wrong parameters test
		await expect(client.showInfo(null)).rejects.toThrow();
	});

	it('should throw an error if not connected', async () => {
		await expect(client.showInfo('gcide')).rejects.toThrow(
			'Connection not established'
		);
	});

	it('should return an error for a nonexistent dictionary', async () => {
		await client.connect(new URL('dict://dict.org'));
		const response = await client.showInfo('unknown');
		expect(response.ok).toBe(false);
		expect(response.status).toBe(550);
		expect(response.message).toBeDefined();
		expect(response.finalStatus).toBeNull();
		expect(response.info).toBeNull();
	});

	it('should return a proper response for a correct dictionary', async () => {
		await client.connect(new URL('dict://dict.mova.org'));
		const response = await client.showInfo('muiswerk');
		expect(response.ok).toBe(true);
		expect(response.status).toBe(112);
		expect(response.message).toBeDefined();
		expect(response.info).not.toBeNull();
		expect(response.info!.length).toBeGreaterThan(0);
		expect(response.finalStatus).not.toBeNull();
	});
});
describe('DictClient.showServer() method', () => {
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
		await expect(client.showServer()).rejects.toThrow(
			'Connection not established'
		);
	});

	it('should return a proper response', async () => {
		await client.connect(new URL('dict://dict.mova.org'));
		const response = await client.showServer();
		expect(response.ok).toBe(true);
		expect(response.status).toBe(114);
		expect(response.message).toBeDefined();
		expect(response.info).not.toBeNull();
		expect(response.info!.length).toBeGreaterThan(0);
		expect(response.finalStatus).not.toBeNull();
	});
});
