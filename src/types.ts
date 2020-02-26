export type CommitMessage = Readonly<{
	type?: string;
	message?: string;
	normalized?: string;
	original: string;
	children?: Array<CommitMessage>;
	notes?: Array<string>;
}>

export type MainCommitMessage = CommitMessage & Required<Pick<CommitMessage, 'children' | 'notes'>>;

export type Commit = MainCommitMessage & Readonly<{
	sha: string;
}>
