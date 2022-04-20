import type { Types } from '@technote-space/github-action-helper';
import { Context } from '@actions/github/lib/context';
import { components } from '@octokit/openapi-types';
import { Utils } from '@technote-space/github-action-helper';
import { MERGE_MESSAGE_PATTERN } from '../constant';
import { Commit, ParentCommitMessage } from '../types';
import { parseCommitMessage } from './misc';

type PullsListCommitsResponseData = components['schemas']['commit'];

const listCommits = async(octokit: Types.Octokit, context: Context): Promise<Array<PullsListCommitsResponseData>> => (octokit.paginate)(
  octokit.rest.pulls.listCommits,
  {
    ...context.repo,
    'pull_number': context.payload.number,
  },
);

export const getCommits = async(types: Array<string>, excludeMessages: Array<string>, breakingChangeNotes: Array<string>, octokit: Types.Octokit, context: Context): Promise<Array<Commit>> =>
  (await listCommits(octokit, context))
    .filter(commit => !MERGE_MESSAGE_PATTERN.test(commit.commit.message))
    .map(commit => ({commit, message: parseCommitMessage(commit.commit.message, types, excludeMessages, breakingChangeNotes)}))
    .filter(item => item.message)
    .map(item => ({
      sha: Utils.ensureNotNull(item.commit.sha),
      ...(item.message as ParentCommitMessage),
    }));

