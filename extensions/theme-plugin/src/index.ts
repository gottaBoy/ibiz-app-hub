import WebTheme from '@ibiz-template/web-theme';
// import { install } from './layout';
// import './theme/index.scss';

export default {
  install(): void {
    // 安装默认主题
    WebTheme.install();
    // 覆盖默认视图布局
    // install((key: string, model: any) => {
    //   ibiz.util.layoutPanel.register(key, model);
    // });
  },
};
