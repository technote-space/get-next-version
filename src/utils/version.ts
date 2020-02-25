import { Context } from '@actions/github/lib/context';
import { Octokit } from '@octokit/rest';
import { Utils, ApiHelper } from '@technote-space/github-action-helper';
import { getCommits } from './commit';
import { Commit } from '../types';
import { VERSION_BUMP } from '../constant';

export const getCurrentVersion = async(helper: ApiHelper): Promise<string> => helper.getLastTag();

export const whatBump = (minorUpdateCommitTypes: Array<string>, commits: Array<Pick<Commit, 'notes' | 'type'>>): keyof typeof VERSION_BUMP => {
	if (commits.filter(commit => commit.notes?.length).length) {
		return 'major';
	}

	if (minorUpdateCommitTypes.length && commits.filter(commit => minorUpdateCommitTypes.includes(commit.type)).length) {
		return 'minor';
	}

	return 'patch';
};

export const getNextVersionLevel = (minorUpdateCommitTypes: Array<string>, commits: Array<Pick<Commit, 'notes' | 'type'>>): number => VERSION_BUMP[whatBump(minorUpdateCommitTypes, commits)];

export const getNextVersion = async(minorUpdateCommitTypes: Array<string>, excludeMessages: Array<string>, breakingChangeNotes: Array<string>, helper: ApiHelper, octokit: Octokit, context: Context): Promise<string> => Utils.generateNewVersion(
	await getCurrentVersion(helper),
	getNextVersionLevel(minorUpdateCommitTypes, await getCommits(minorUpdateCommitTypes, excludeMessages, breakingChangeNotes, octokit, context)),
);
