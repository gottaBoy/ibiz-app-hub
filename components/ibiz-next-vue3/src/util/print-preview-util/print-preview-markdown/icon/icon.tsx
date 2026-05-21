const ArrowLeftBold = (): JSX.Element => (
  <svg
    data-v-9a20e128=''
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 1024 1024'
    width='1em'
    height='1em'
  >
    <path
      fill='currentColor'
      d='M685.248 104.704a64 64 0 0 1 0 90.496L368.448 512l316.8 316.8a64 64 0 0 1-90.496 90.496L232.704 557.248a64 64 0 0 1 0-90.496l362.048-362.048a64 64 0 0 1 90.496 0z'
    ></path>
  </svg>
);

const ArrowRightBold = (): JSX.Element => (
  <svg
    data-v-9a20e128=''
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 1024 1024'
    width='1em'
    height='1em'
  >
    <path
      fill='currentColor'
      d='M338.752 104.704a64 64 0 0 0 0 90.496l316.8 316.8-316.8 316.8a64 64 0 0 0 90.496 90.496l362.048-362.048a64 64 0 0 0 0-90.496L429.248 104.704a64 64 0 0 0-90.496 0z'
    ></path>
  </svg>
);

// 全屏图标
const FullScreenSvg = (): JSX.Element => (
  <svg viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg'>
    <path d='M547.4 197.4v46l200.3 0.1L546.1 444l32.4 32.6 201.9-200.7v200.9h46V197.5zM471.4 584.4l-32.6-32.6L243.6 747V547.9h-46v278.7h279v-46H275z'></path>
  </svg>
);

// 退出全屏图标
const CloseFullScreenSvg = (): JSX.Element => (
  <svg viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg'>
    <path d='M544 480V282.944h52.224l0.064 107.968L763.072 224l36.928 36.928-166.976 166.976 108.032-0.128V480H544zM260.928 800l-36.928-36.928 166.912-166.784-107.968-0.064V544H480v197.056h-52.224l0.064-107.968L260.928 800z'></path>
  </svg>
);

// 关闭图标
const CloseSvg = (): JSX.Element => (
  <svg viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg'>
    <path d='M843.904 783.573333 783.573333 843.904 512.042667 572.373333 240.512 843.904 180.181333 783.573333 451.712 512.042667 180.181333 240.512 240.512 180.181333 512.042667 451.712 783.573333 180.181333 843.904 240.512 572.373333 512.042667 843.904 783.573333Z'></path>
  </svg>
);

export {
  ArrowLeftBold,
  ArrowRightBold,
  FullScreenSvg,
  CloseFullScreenSvg,
  CloseSvg,
};
