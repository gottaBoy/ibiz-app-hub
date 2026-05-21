/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { cloneDeep } from 'lodash-es';
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { Namespace } from '../../../utils';
import { IChatToolCall } from '../../../interface';
import {
  ErrorSvg,
  ExpandSvg,
  CopyingSvg,
  KnowledgeSvg,
  CopyPasteSvg,
} from '../../../icons';
import './chunk-tool-call.scss';

interface IChunk {
  /**
   * @description 文档标识
   * @type {string}
   * @memberof IChunk
   */
  docid: string;
  /**
   * @description 置信度
   * @type {number}
   * @memberof IChunk
   */
  similarity: number;
  /**
   * @description 主键
   * @type {string}
   * @memberof IChunk
   */
  id: string;
  /**
   * @description 文档名称
   * @type {string}
   * @memberof IChunk
   */
  docname: string;
  /**
   * @description 内容
   * @type {string}
   * @memberof IChunk
   */
  content: string;
  /**
   * @description 父键
   * @type {string}
   * @memberof IChunk
   */
  pid?: string;
  /**
   * @description 类型
   * @type {('CLUSTER':'聚合文本' | 'SOURCE':'素材文本' | 'KBGUIDANCE':'知识库介绍' | 'ORIGINAL':'原始文本' | 'MANUAL':'手动文本' | 'GRAPH':'知识图谱')}
   * @memberof IChunk
   */
  type?: 'CLUSTER' | 'SOURCE' | 'KBGUIDANCE' | 'ORIGINAL' | 'MANUAL' | 'GRAPH';
  /**
   * @description 源数量
   * @type {number}
   * @memberof IChunk
   */
  source_count?: number;
  /**
   * @description 字数据
   * @type {IChunk[]}
   * @memberof IChunk
   */
  children?: IChunk[];
  /**
   * @description 是否展开
   * @type {boolean}
   * @memberof IChunk
   */
  isExpand?: boolean;

  /**
   * @description 原始相似度
   * @type {number}
   * @memberof IChunk
   */
  original?: number;
}

export interface ChunkToolCallProps {
  item: IChatToolCall;
  className?: string;
}

export const ChunkToolCall = (props: ChunkToolCallProps) => {
  const ns = new Namespace('chunk-tool-call');

  const chunks = useSignal<IChunk[]>([]);

  // 是否展开
  const isExpand = useSignal<boolean>(false);
  // 是否正在拷贝
  const isCopying = useSignal<boolean>(false);
  // 定时器ID
  let timerId: NodeJS.Timeout | undefined;

  // 处理折叠
  const onCollapse = () => {
    isExpand.value = !isExpand.value;
  };

  // 处理复制
  const onCopy = (event: MouseEvent) => {
    event.stopPropagation();
    if (isCopying.value) return;
    if (timerId) clearTimeout(timerId);
    isCopying.value = true;
    navigator.clipboard.writeText(JSON.stringify(props.item, undefined, 2));
    (window as any).ibiz.message.success('已复制');
    timerId = setTimeout(() => {
      isCopying.value = false;
    }, 2000);
  };

  useEffect(() => {
    // 处理知识库数据
    const resultChunks = cloneDeep(props.item.result?.chunks || []);

    const source: IChunk[] = resultChunks.filter(
      (chunk: IChunk) => chunk.type === 'SOURCE',
    );
    const _chunks: IChunk[] = resultChunks.filter(
      (chunk: IChunk) => chunk.type !== 'SOURCE',
    );

    _chunks.forEach(chunk => {
      if (chunk.type === 'CLUSTER') {
        chunk.children = source.filter(s => s.pid === chunk.id);
        chunk.isExpand = false;
      }
    });
    chunks.value = _chunks;
  }, [props.item]);

  // 添加 useEffect 来处理组件销毁时的清理，空依赖数组表示只在组件挂载和销毁时执行
  useEffect(() => {
    // 返回清理函数，在组件销毁时执行
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  /**
   * @description 块展示改变
   * @param {MouseEvent} event
   * @param {IChunk} chunk
   */
  const onChunkExpand = (event: MouseEvent, chunk: IChunk) => {
    event.stopPropagation();
    chunk.isExpand = !chunk.isExpand;
    // 改变地址值触发界面响应
    chunks.value = [...chunks.value];
  };

  /**
   * @description 绘制底部
   * @param {IChunk} chunk
   * @returns {*}
   */
  const renderFooter = (chunk: IChunk) => {
    return (
      <div className={ns.e('footer')}>
        {chunk.type === 'CLUSTER' &&
          (chunk.source_count || chunk.source_count === 0) && (
            <div className={ns.em('footer', 'description')}>
              由{chunk.source_count}个原文段落智能总结生成
            </div>
          )}
        <div className={ns.em('footer', 'docname')}>{chunk.docname}</div>
      </div>
    );
  };

  /**
   * @description 绘制项
   * @param {IChunk} chunk
   * @returns {*}
   */
  const renderItem = (chunk: IChunk) => {
    return (
      <div
        key={chunk.id}
        className={`${ns.e('item')} ${ns.em('item', chunk.type?.toLowerCase() || 'default')}`}
      >
        {chunk.type === 'KBGUIDANCE' ? (
          <div className={ns.e('kbguidance')}>[引导]</div>
        ) : (
          <div
            className={ns.e('similarity')}
            style={`--percent: ${((chunk.similarity || 0) * 100).toFixed(2)}%;`}
          >{`SCORE ${(chunk.similarity || 0).toFixed(2)}`}</div>
        )}

        {chunk.original && (
          <div
            className={ns.e('original')}
          >{`(向量${(chunk.original || 0).toFixed(2)})`}</div>
        )}
        <div className={ns.em('item', 'content')} title={chunk.content}>
          {chunk.content}
        </div>
      </div>
    );
  };

  /**
   * @description 绘制块
   * @param {IChunk} chunk
   * @returns {*}
   */
  const renderChunk = (chunk: IChunk) => {
    if (chunk.type === 'CLUSTER')
      return (
        <div key={chunk.id} className={`${ns.e('chunk')} ${ns.e('cluster')}`}>
          <div className={ns.em('cluster', 'header')}>
            <div
              className={ns.e('similarity')}
              style={`--percent: ${((chunk.similarity || 0) * 100).toFixed(2)}%;`}
            >{`SCORE ${(chunk.similarity || 0).toFixed(2)}`}</div>
            {chunk.original && (
              <div
                className={ns.e('original')}
              >{`(向量${(chunk.original || 0).toFixed(2)})`}</div>
            )}
            <div className={ns.em('cluster', 'title')}>[摘要]</div>
            <div className={ns.em('cluster', 'summary')} title={chunk.content}>
              {chunk.content}
            </div>
          </div>
          <div className={ns.em('cluster', 'content')}>
            <div
              className={ns.em('cluster', 'icon')}
              onClick={evt => onChunkExpand(evt, chunk)}
            >
              <ExpandSvg
                style={{
                  transform: chunk.isExpand ? 'rotate(90deg)' : 'rotate(0deg)',
                }}
              />
              {`命中 ${chunk.children?.length || 0} 个子段落`}
            </div>
            {chunk.isExpand && (
              <div className={ns.em('cluster', 'children')}>
                {chunk.children?.map(child => renderItem(child))}
              </div>
            )}
          </div>
          {renderFooter(chunk)}
        </div>
      );
    return (
      <div key={chunk.id} className={`${ns.e('chunk')} ${ns.e('default')}`}>
        {renderItem(chunk)}
        {renderFooter(chunk)}
      </div>
    );
  };

  /**
   * @description 绘制内容
   * @returns {*}
   */
  const renderContent = () => {
    if (props.item.error)
      return (
        <div className={`${ns.e('error')} ${ns.e('center-text')}`}>
          {props.item.result}
        </div>
      );

    return chunks.value.length > 0 ? (
      chunks.value.map(chunk => renderChunk(chunk))
    ) : (
      <div className={`${ns.e('center-text')}`}>无数据</div>
    );
  };

  return (
    <div className={`${ns.b()} ${props.className || ''}`}>
      <div className={ns.e('header')} onClick={() => onCollapse()}>
        <div className={ns.e('header-left')}>
          <div className={ns.em('header-left', 'icon')}>{KnowledgeSvg}</div>
          <div className={ns.em('header-left', 'caption')}>知识库检索：</div>
          <div
            className={ns.em('header-left', 'desc')}
            title={props.item.result?.query}
          >
            {props.item.result?.query}
          </div>
        </div>
        <div className={ns.e('header-right')}>
          {props.item.error && <span style='color: red;'>发生错误</span>}
          {props.item.error && ErrorSvg}
          <span
            title='复制'
            className={ns.e('copy')}
            onClick={(event: MouseEvent) => onCopy(event)}
          >
            {isCopying.value ? CopyingSvg : CopyPasteSvg}
          </span>
          <ExpandSvg
            style={{
              'margin-left': ' 6px',
              transform: isExpand.value ? 'rotate(90deg)' : 'rotate(0deg)',
            }}
          />
        </div>
      </div>
      {isExpand.value && (
        <div className={ns.e('content')}>{renderContent()}</div>
      )}
    </div>
  );
};
