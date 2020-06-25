export type CommitMessage = Readonly<{
  type?: string;
  message?: string;
  normalized?: string;
  original: string;
  children?: Array<ChildCommitMessage>;
  notes?: Array<string>;
}>

export type ParentCommitMessage = CommitMessage & Required<Pick<CommitMessage, 'children' | 'notes'>>;
export type ChildCommitMessage = Required<Omit<CommitMessage, 'children' | 'notes'>>;

export type Commit = ParentCommitMessage & Readonly<{
  sha: string;
}>
