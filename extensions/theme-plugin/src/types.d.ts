import '@ibiz-template/runtime';

declare module '@ibiz-template/web-theme' {
  const WebTheme: {
    install(): void;
  };

  export default WebTheme;
}
