export interface NoteMeta {
  id: string;
  title: string;
  domain: string;
  topic: string;
  topicId?: string;
  tags: string[];
  created: string;
  updated: string;
  links: string[];
}

export interface Note {
  meta: NoteMeta;
  content: string;
}

export interface TopicOption {
  id: string;
  name: string;
  children?: TopicOption[];
}

export interface DomainDef {
  name: string;
  key: string;
  color: string;
  icon: string;
  topics: TopicOption[];
}
