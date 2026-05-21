import { IKnowledgeBase } from '../../interface';

export class KnowledgeBase implements IKnowledgeBase {
  get id(): string {
    return this.knowledgeBase.id;
  }

  get name(): string {
    return this.knowledgeBase.name;
  }

  get value(): string {
    return this.knowledgeBase.id;
  }

  get label(): string {
    return this.knowledgeBase.name;
  }

  constructor(public knowledgeBase: IKnowledgeBase) {}
}
