import { Context } from '@actions/github/lib/context';
import { Utils, ApiHelper, Logger } from '@technote-space/github-action-helper';
import { Octokit } from '@technote-space/github-action-helper/dist/types';
import { getCommits } from './commit';
import { log } from './misc';
import { Commit } from '../types';
import { VERSION_BUMP } from '../constant';

export const getCurrentVersion = async(helper: ApiHelper): Promise<string> => helper.getLastTag();

export const whatBump = (minorUpdateCommitTypes: Array<string>, commits: Array<Pick<Commit, 'notes' | 'type'>>): keyof typeof VERSION_BUMP => {
  if (commits.filter(commit => commit.notes.length).length) {
    return 'major';
  }

  if (minorUpdateCommitTypes.length && commits.filter(commit => commit.type && minorUpdateCommitTypes.includes(commit.type)).length) {
    return 'minor';
  }

  return 'patch';
};

export const getNextVersionLevel = (minorUpdateCommitTypes: Array<string>, commits: Array<Pick<Commit, 'notes' | 'type'>>): number => VERSION_BUMP[whatBump(minorUpdateCommitTypes, commits)];

export const getNextVersion = async(minorUpdateCommitTypes: Array<string>, excludeMessages: Array<string>, breakingChangeNotes: Array<string>, helper: ApiHelper, octokit: Octokit, context: Context, logger?: Logger): Promise<string> => {
  const commits = await getCommits(minorUpdateCommitTypes, excludeMessages, breakingChangeNotes, octokit, context);
  log(logger => logger.startProcess('Target commits:'), logger);
  log(() => console.log(
    commits
      .filter(item => item.notes.length || item.type)
      .map(item => ({
        type: item.type,
        message: item.message,
        notes: item.notes,
        sha: item.sha,
      })),
  ), logger);
  log(logger => logger.endProcess(), logger);

  const current = await getCurrentVersion(helper);
  log(logger => logger.info('Current version: %s', current), logger);

  const next = Utils.generateNewVersion(
    current,
    getNextVersionLevel(minorUpdateCommitTypes, commits),
  );
  log(logger => logger.info('Next version: %s', next), logger);

  return next;
};