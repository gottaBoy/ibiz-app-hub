/* eslint-disable no-continue */
/**
 * 路径分割成路由片段
 * @param path
 * @returns
 */
export const splitPathToSegments = (path: string): string[] => {
  const segments: string[] = [];
  let currentSegment = '';
  let parenCount = 0;

  for (let i = 0; i < path.length; i++) {
    const char = path[i];

    if (char === '/') {
      if (parenCount === 0) {
        // 不在括号内，可以分割
        if (currentSegment) {
          segments.push(currentSegment);
          currentSegment = '';
        }
        continue;
      } else {
        // 在括号内，不能分割
        currentSegment += char;
      }
    } else {
      if (char === '(') {
        parenCount += 1;
      } else if (char === ')') {
        parenCount -= 1;
      }
      currentSegment += char;
    }
  }

  // 添加最后一个段
  if (currentSegment) {
    segments.push(currentSegment);
  }

  return segments;
};

/**
 * 验证路由片段
 * @param segments
 * @returns
 */
export const validateRouteSegments = (segments: string[]): boolean => {
  // 检查数组长度是否符合 2n+1 规则且最少3个元素
  if (segments.length < 3 || segments.length % 2 === 0) {
    return false;
  }
  const paramReg = `:[^()]+\\(\\[\\^/\\]\\+=\\[\\^/\\]\\+\\|${ibiz.env.routePlaceholder}\\)`; // 视图参数正则
  const viewReg = `[^=/]+`; // 视图资源正则
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];

    if (i % 2 === 0) {
      // 偶数位是参数 (params)
      const paramRegex = new RegExp(`^${paramReg}$`);
      if (!paramRegex.test(segment) && segment !== ibiz.env.routePlaceholder) {
        return false;
      }
    } else {
      // 奇数位是视图资源 (view)
      const viewRegex = new RegExp(`^${viewReg}$`);
      if (!viewRegex.test(segment)) {
        return false;
      }
    }
  }
  return true;
};
