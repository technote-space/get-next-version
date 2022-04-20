import type { ParentCommitMessage, ChildCommitMessage } from '../types';
import type { Logger } from '@technote-space/github-action-log-helper';
import { SEMANTIC_MESSAGE_PATTERN } from '../constant';

export const parseLine = (message: string): ChildCommitMessage | undefined => {
  const trim    = message.trim();
  const matches = trim.match(SEMANTIC_MESSAGE_PATTERN);
  if (!matches) {
    return undefined;
  }

  return {
    type: matches[1],
    message: matches[3],
    normalized: `${matches[1]}: ${matches[3]}`,
    original: trim,
  };
};

export const normalize = (messages: Array<string>): Array<string> => messages.map(item => item.toLowerCase());

export const isValidMessage = (type: string, message: string, types: Array<string>, excludeMessages: Array<string>): boolean => types.includes(type) && !excludeMessages.includes(message.toLowerCase());

export const parseCommitMessage = (message: string, types: Array<string>, excludeMessages: Array<string>, breakingChangeNotes: Array<string>): ParentCommitMessage | undefined => {
  const normalizedExcludeMessages = normalize(excludeMessages);
  const messages                  = message.trim().split(/\r?\n|\r/);
  const trim                      = messages[0].trim();
  const matches                   = trim.match(SEMANTIC_MESSAGE_PATTERN);
  if (!matches) {
    return undefined;
  }

  const notes    = [] as Array<string>;
  const children = [] as Array<ChildCommitMessage>;
  messages
    .slice(1)    // eslint-disable-line no-magic-numbers
    .map(message => parseLine(message))
    .filter(item => item)
    .map(item => item as ChildCommitMessage)
    .forEach(item => {
      if (breakingChangeNotes.length && breakingChangeNotes.includes(item.type)) {
        notes.push(item.original);
      } else if (isValidMessage(item.type, item.message, types, normalizedExcludeMessages)) {
        children.push(item);
      }
    });

  if (!isValidMessage(matches[1], matches[3], types, normalizedExcludeMessages) && (!children.length && !notes.length)) {
    return undefined;
  }

  return {
    type: matches[1],
    message: matches[3],
    normalized: `${matches[1]}: ${matches[3]}`,
    original: trim,
    children,
    notes,
  };
};

export const log = (log: (logger: Logger) => void, logger?: Logger): void => {
  if (logger) {
    log(logger);
  }
};
