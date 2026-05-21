/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*.vue' {
  import { ComponentOptions } from 'vue';

  const componentOptions: ComponentOptions;
  export default componentOptions;
}

declare module '@ibiz-template/mob-theme';

declare global {
  interface Window {
    wx?: any;
  }
}

export {};
