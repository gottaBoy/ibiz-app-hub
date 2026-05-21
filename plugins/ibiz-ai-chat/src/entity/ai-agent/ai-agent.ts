import { IAIAgent, IAIKnowledgeBase } from '../../interface';

export class AIAgent implements IAIAgent {
  get id(): string {
    return this.agent.id;
  }

  get caption(): string {
    return this.agent.caption;
  }

  get default(): 0 | 1 {
    return this.agent.default;
  }

  get order(): number | undefined {
    return this.agent.order;
  }

  get value(): string {
    return this.agent.id;
  }

  get label(): string {
    return this.agent.caption;
  }

  get knowledge_bases(): IAIKnowledgeBase[] | undefined {
    return this.agent.knowledge_bases;
  }

  get allow_any_knowledge_base(): 0 | 1 {
    return this.agent.allow_any_knowledge_base;
  }

  get rerank(): 0 | 1 | 2 {
    return this.agent.rerank || this.defaultConfig.chunkrerank;
  }

  get maxchunks(): number {
    return this.agent.maxchunks || this.defaultConfig.maxchunks;
  }

  get chunkthreshold(): number {
    return this.agent.chunkthreshold || this.defaultConfig.chunkthreshold;
  }

  constructor(
    public agent: IAIAgent,
    public defaultConfig: {
      chunkrerank: 0 | 1 | 2;
      maxchunks: number;
      chunkthreshold: number;
    },
  ) {}
}
