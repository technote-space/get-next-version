// <type>(<scope>): <subject>
// @see https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716#semantic-commit-messages
export const SEMANTIC_MESSAGE_PATTERN = /^(.+?)!?\s*(\(.+?\)\s*)?:\s*(.+?)\s*$/;
export const MERGE_MESSAGE_PATTERN    = /^Merge pull request #\d+ /;
export const VERSION_BUMP             = {
	'major': 0,
	'minor': 1,
	'patch': 2,
} as const;
