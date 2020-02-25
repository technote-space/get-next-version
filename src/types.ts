export type CommitMessage = Readonly<{
	type: string;
	message: string;
	normalized: string;
	original: string;
	children?: Array<CommitMessage>;
	notes?: Array<string>;
}>

export type Commit = Required<CommitMessage> & Readonly<{
	sha: string;
}>
