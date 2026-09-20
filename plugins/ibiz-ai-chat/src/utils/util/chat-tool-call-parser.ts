import { aiChatT } from '..';
/* eslint-disable no-useless-escape */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { IChatToolCall } from '../../interface';

/**
 * @description 工具调用解析器
 * @export
 * @class ChatToolCallParser
 */
export class ChatToolCallParser {
  /**
   * 解析工具调用字符串
   * @param toolCallString
   * @returns
   */
  static parse(toolCallString: string): {
    completed: boolean;
    toolCalls: IChatToolCall[];
  } {
    let completed = true;
    // 返回不完整的工具调用
    if (
      toolCallString.indexOf('<tool_call>') !== -1 &&
      toolCallString.indexOf('</tool_call>') === -1
    ) {
      completed = false;
    }
    // 使用正则表达式匹配被<tool_call>和</tool_call>包围的内容
    // eslint-disable-next-line prefer-regex-literals
    const toolCallRegex = new RegExp(
      '<tool_call>\\s*({[\\s\\S]*?})\\s*</tool_call>',
      'g',
    );
    const matches = toolCallString.matchAll(toolCallRegex);
    const toolCalls: IChatToolCall[] = [];
    for (const match of matches) {
      try {
        const toolCallData = JSON.parse(match[1]);
        const tempToolCall = {
          name: toolCallData.name,
          parameters: toolCallData.parameters,
          error: toolCallData.error || false,
          type: toolCallData.type,
        };
        if (toolCallData.result) {
          let result = toolCallData.result;
          try {
            if (['desc_oss_image', 'fetch_chunks'].includes(toolCallData.type))
              result = JSON.parse(toolCallData.result);
          } catch (error) {
            console.error(
              aiChatT('toolParseFailed', { type: tempToolCall.type }),
              error,
            );
          } finally {
            Object.assign(tempToolCall, {
              result,
            });
          }
        }
        toolCalls.push(tempToolCall);
      } catch (e) {
        console.error(aiChatT('parseToolFailed'), e);
      }
    }
    return { completed, toolCalls };
  }
}
