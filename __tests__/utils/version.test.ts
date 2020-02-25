/* eslint-disable no-magic-numbers */
import { Logger, ApiHelper } from '@technote-space/github-action-helper';
import nock from 'nock';
import { resolve } from 'path';
import {
	generateContext,
	disableNetConnect,
	getApiFixture,
	getOctokit,
} from '@technote-space/github-action-test-helper';
import { getCurrentVersion, whatBump, getNextVersionLevel, getNextVersion } from '../../src/utils/version';

const fixtureRootDir = resolve(__dirname, '..', 'fixtures');
const octokit        = getOctokit();
const context        = generateContext({owner: 'hello', repo: 'world', ref: 'refs/pull/123/merge'}, {
	payload: {
		number: 123,
		'pull_request': {
			head: {
				ref: 'feature/change',
			},
		},
	},
});
const logger         = new Logger();
const helper         = new ApiHelper(octokit, context, logger);

describe('getCurrentVersion', () => {
	disableNetConnect(nock);

	it('should get current version 1', async() => {
		nock('https://api.github.com')
			.persist()
			.get('/repos/hello/world/git/matching-refs/tags/')
			.reply(200, () => getApiFixture(fixtureRootDir, 'repos.git.matching-refs'));

		expect(await getCurrentVersion(helper)).toBe('v2.0.0');
	});

	it('should get current version 2', async() => {
		nock('https://api.github.com')
			.persist()
			.get('/repos/hello/world/git/matching-refs/tags/')
			.reply(200, () => []);

		expect(await getCurrentVersion(helper)).toBe('v0.0.0');
	});
});

describe('whatBump', () => {
	it('should return major', () => {
		expect(whatBump([], [
			{type: 'test', notes: ['BREAKING CHANGE: test']},
			{type: 'chore', notes: []},
			{type: 'style', notes: []},
			{type: 'feat', notes: []},
		])).toBe('major');
	});

	it('should return minor', () => {
		expect(whatBump(['feat'], [
			{type: 'chore', notes: []},
			{type: 'style', notes: []},
			{type: 'feat', notes: []},
		])).toBe('minor');
	});

	it('should return patch', () => {
		expect(whatBump([], [])).toBe('patch');
		expect(whatBump(['feat'], [
			{type: 'chore', notes: []},
			{type: 'style', notes: []},
		])).toBe('patch');
	});
});

describe('getNextVersionLevel', () => {
	it('should return major level', () => {
		expect(getNextVersionLevel([], [
			{type: 'test', notes: ['BREAKING CHANGE: test']},
		])).toBe(0);
	});

	it('should return minor level', () => {
		expect(getNextVersionLevel(['feat'], [
			{type: 'feat', notes: []},
		])).toBe(1);
	});

	it('should return patch level', () => {
		expect(getNextVersionLevel([], [])).toBe(2);
		expect(getNextVersionLevel(['feat'], [
			{type: 'chore', notes: []},
			{type: 'style', notes: []},
		])).toBe(2);
	});
});

describe('getNextVersion', () => {
	disableNetConnect(nock);

	it('should get next version 1-1', async() => {
		nock('https://api.github.com')
			.persist()
			.get('/repos/hello/world/git/matching-refs/tags/')
			.reply(200, () => [])
			.get('/repos/hello/world/pulls/123/commits')
			.reply(200, () => getApiFixture(fixtureRootDir, 'commit.list1'));

		expect(await getNextVersion([], [], [], helper, octokit, context)).toBe('v0.0.1');
	});

	it('should get next version 1-2', async() => {
		nock('https://api.github.com')
			.persist()
			.get('/repos/hello/world/git/matching-refs/tags/')
			.reply(200, () => [])
			.get('/repos/hello/world/pulls/123/commits')
			.reply(200, () => getApiFixture(fixtureRootDir, 'commit.list1'));

		expect(await getNextVersion(['fix'], [], [], helper, octokit, context)).toBe('v0.1.0');
	});

	it('should get next version 1-3', async() => {
		nock('https://api.github.com')
			.persist()
			.get('/repos/hello/world/git/matching-refs/tags/')
			.reply(200, () => [])
			.get('/repos/hello/world/pulls/123/commits')
			.reply(200, () => getApiFixture(fixtureRootDir, 'commit.list1'));

		expect(await getNextVersion(['fix'], ['all the bugs'], [], helper, octokit, context)).toBe('v0.0.1');
	});

	it('should get next version 2', async() => {
		nock('https://api.github.com')
			.persist()
			.get('/repos/hello/world/git/matching-refs/tags/')
			.reply(200, () => getApiFixture(fixtureRootDir, 'repos.git.matching-refs'))
			.get('/repos/hello/world/pulls/123/commits')
			.reply(200, () => getApiFixture(fixtureRootDir, 'commit.list2'));

		expect(await getNextVersion(['feat'], [], ['BREAKING CHANGE'], helper, octokit, context)).toBe('v3.0.0');
	});

	it('should get next version 3', async() => {
		nock('https://api.github.com')
			.persist()
			.get('/repos/hello/world/git/matching-refs/tags/')
			.reply(200, () => getApiFixture(fixtureRootDir, 'repos.git.matching-refs'))
			.get('/repos/hello/world/pulls/123/commits')
			.reply(200, () => getApiFixture(fixtureRootDir, 'commit.list3'));

		expect(await getNextVersion(['feat'], [], ['BREAKING CHANGE'], helper, octokit, context)).toBe('v2.1.0');
	});
});
