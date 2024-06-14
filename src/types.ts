export type TableRow = {
  type?: string;
  value?: string;
  children: Map<string, TableRow>;
};

export type CnvNode = {
  id: string;
  children: string[];
  parents: Set<string>;
  text: string;
  force: string | number;
  isPlayer: boolean;
  speaker: string;
  generic?: string;
  reactions: [string, string][];
  actionString: string;
  conditionString: string;
  conditionMatters: boolean;
};

export type Conversations = [Map<string, CnvNode>, string[]];
