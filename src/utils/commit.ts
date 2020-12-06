import { Context } from '@actions/github/lib/context';
import { Octokit } from '@technote-space/github-action-helper/dist/types';
import { ensureNotNull } from '@technote-space/github-action-helper/dist/utils';
import { PaginateInterface } from '@octokit/plugin-paginate-rest';
import { RestEndpointMethods } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/method-types';
import { components } from '@octokit/openapi-types';
import { parseCommitMessage } from './misc';
import { Commit, ParentCommitMessage } from '../types';
import { MERGE_MESSAGE_PATTERN } from '../constant';

type PullsListCommitsResponseData = components['schemas']['commit'];

const listCommits = async(octokit: Octokit, context: Context): Promise<Array<PullsListCommitsResponseData>> => (octokit.paginate as PaginateInterface)(
  (octokit as RestEndpointMethods).pulls.listCommits,
  {
    ...context.repo,
    'pull_number': context.payload.number,
  },
);

export const getCommits = async(types: Array<string>, excludeMessages: Array<string>, breakingChangeNotes: Array<string>, octokit: Octokit, context: Context): Promise<Array<Commit>> =>
  (await listCommits(octokit, context))
    .filter(commit => !MERGE_MESSAGE_PATTERN.test(commit.commit.message))
    .map(commit => ({commit, message: parseCommitMessage(commit.commit.message, types, excludeMessages, breakingChangeNotes)}))
    .filter(item => item.message)
    .map(item => ({
      sha: ensureNotNull(item.commit.sha),
      ...(item.message as ParentCommitMessage),
    }));

