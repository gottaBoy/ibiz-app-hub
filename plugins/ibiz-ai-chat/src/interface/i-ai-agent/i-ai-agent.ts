export interface IAIKnowledgeBase {
  /**
   * 知识库标识
   */
  ai_knowledge_base_id: string;
  /**
   * 知识库名称
   */
  ai_knowledge_base_name: string;
}

/**
 * 智能体配置
 */
export interface IAIAgentConfig {
  /**
   * 召回重排
   * (禁用|启用|自动)
   */
  chunkrerank: 0 | 1 | 2;

  /**
   * 最大召回数量
   */
  maxchunks: number;

  /**
   * 召回相似度阈值
   */
  chunkthreshold: number;
}

/**
 * ai代理接口
 */
export interface IAIAgent {
  /**
   * 代理标识
   */
  id: string;
  /**
   * 代理名称
   */
  caption: string;
  /**
   * 是否默认代理，1：是，0：否
   */
  default: 0 | 1;
  /**
   * 排序
   */
  order: number | undefined;
  /**
   * 知识库数据
   */
  knowledge_bases?: IAIKnowledgeBase[];
  /**
   * 是否允许任意知识库
   */
  allow_any_knowledge_base: 0 | 1;

  /**
   * 召回重排
   * (禁用|启用|自动)
   */
  rerank: 0 | 1 | 2;

  /**
   * 最大召回数量
   */
  maxchunks: number;

  /**
   * 召回相似度阈值
   */
  chunkthreshold: number;
}
