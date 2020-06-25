import { Context } from '@actions/github/lib/context';
import { Octokit } from '@technote-space/github-action-helper/dist/types';
import { PullsListCommitsResponseData } from '@octokit/types/dist-types/generated/Endpoints';
import { parseCommitMessage } from './misc';
import { Commit, ParentCommitMessage } from '../types';
import { MERGE_MESSAGE_PATTERN } from '../constant';

const listCommits = async(octokit: Octokit, context: Context): Promise<PullsListCommitsResponseData> => octokit.paginate(
  octokit.pulls.listCommits.endpoint.merge({
    ...context.repo,
    'pull_number': context.payload.number,
  }),
);

export const getCommits = async(types: Array<string>, excludeMessages: Array<string>, breakingChangeNotes: Array<string>, octokit: Octokit, context: Context): Promise<Array<Commit>> =>
  (await listCommits(octokit, context))
    .filter(commit => !MERGE_MESSAGE_PATTERN.test(commit.commit.message))
    .map(commit => ({commit, message: parseCommitMessage(commit.commit.message, types, excludeMessages, breakingChangeNotes)}))
    .filter(item => item.message)
    .map(item => ({
      sha: item.commit.sha,
      ...(item.message as ParentCommitMessage),
    }));

