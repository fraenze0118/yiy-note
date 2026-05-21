/** Type-only. All data lives in content/topics.json. Utility functions are in lib/topics-data.ts. */

export interface TopicNode {
  id: string;
  name: string;
  children?: TopicNode[];
}
