/* eslint-disable no-cond-assign */
import { IChatStep } from '../../interface';

/**
 * 聊天步骤解析器
 */
export class ChatStepParser {
  /**
   * 解析聊天步骤字符串
   * @param chatStepString
   * @returns
   */
  static parse(chatStepString: string): IChatStep[] {
    // 使用正则表达式匹配所有<chatstep>开始标签和</chatstep>结束标签的数量
    const startTags = (chatStepString.match(/<chatstep>/g) || []).length;
    const endTags = (chatStepString.match(/<\/chatstep>/g) || []).length;
    // 如果开始标签数量不等于结束标签数量，则表示有未完成的标签
    const completed = startTags === endTags;

    // 使用正则表达式匹配被<chatstep>和</chatstep>包围的内容
    // eslint-disable-next-line prefer-regex-literals
    const completeRegex = new RegExp(
      '<chatstep>\\s*({[\\s\\S]*?})\\s*</chatstep>',
      'g',
    );
    const completeMatches = chatStepString.matchAll(completeRegex);
    const chatSteps: IChatStep[] = [];
    for (const match of completeMatches) {
      try {
        const chatStepData = JSON.parse(match[1]);
        const tempChatStep = {
          title: chatStepData.title,
          content: chatStepData.content,
          status: chatStepData.status || 'success',
        };
        chatSteps.push(tempChatStep);
      } catch (e) {
        console.error('解析完整聊天步骤失败:', e);
      }
    }
    // 如果存在未闭合的标签，添加pending状态的步骤
    if (!completed) {
      const allStartTagIndices = [];
      let startIndex = 0;
      while (
        (startIndex = chatStepString.indexOf('<chatstep>', startIndex)) !== -1
      ) {
        allStartTagIndices.push(startIndex);
        startIndex += '<chatstep>'.length;
      }

      // 查找所有结束标签位置
      const allEndTagIndices: number[] = [];
      startIndex = 0;
      while (
        (startIndex = chatStepString.indexOf('</chatstep>', startIndex)) !== -1
      ) {
        allEndTagIndices.push(startIndex);
        startIndex += '</chatstep>'.length;
      }

      // 找出哪些开始标签没有对应的结束标签
      const unmatchedStartTags = allStartTagIndices.filter(startIdx => {
        // 检查此开始标签之后是否有一个结束标签
        const correspondingEndTag = allEndTagIndices.find(
          endIdx => endIdx > startIdx,
        );
        return !correspondingEndTag;
      });

      // 为每个未匹配的开始标签添加一个pending状态的步骤
      for (let i = 0; i < unmatchedStartTags.length; i++) {
        chatSteps.push({
          title: '',
          content: '',
          status: 'pending',
        });
      }
    }
    return chatSteps;
  }
}
