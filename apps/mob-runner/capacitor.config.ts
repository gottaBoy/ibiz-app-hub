import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'iBiz移动端示例',
  webDir: 'dist',
  server: {
    url: 'https://open.ibizlab.cn/qsmob/',
  },
};

export default config;
