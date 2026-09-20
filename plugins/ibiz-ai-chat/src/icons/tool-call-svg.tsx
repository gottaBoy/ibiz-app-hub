import { aiChatT } from '../utils';
/* eslint-disable @typescript-eslint/no-explicit-any */

export const ErrorSvg = (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='14'
    height='14'
    viewBox='0 0 24 24'
    fill='none'
    stroke='red'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    aria-hidden='true'
    style='margin-left: 6px;'
  >
    <path d='m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3'></path>
    <path d='M12 9v4'></path>
    <path d='M12 17h.01'></path>
  </svg>
);

export const CopyingSvg = (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='14'
    height='14'
    viewBox='0 0 24 24'
    fill='none'
    stroke='rgb(0, 185, 107)'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className='lucide lucide-check'
    aria-hidden='true'
    style='margin-left: 6px;'
  >
    <path d='M20 6 9 17l-5-5'></path>
  </svg>
);

export const CopyPasteSvg = (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='14'
    height='14'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    aria-hidden='true'
    style='margin-left: 6px;'
  >
    <rect width='14' height='14' x='8' y='8' rx='2' ry='2'></rect>
    <path d='M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2'></path>
  </svg>
);

export const ExpandSvg = (props: { style?: any }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='18'
    height='18'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.5'
    strokeLinecap='round'
    strokeLinejoin='round'
    aria-hidden='true'
    style={props.style}
  >
    <path d='m9 18 6-6-6-6'></path>
  </svg>
);

export const KnowledgeSvg = (
  <svg
    className='icon'
    title={aiChatT('knowledgeBase')}
    viewBox='0 0 1024 1024'
    version='1.1'
    xmlns='http://www.w3.org/2000/svg'
    width='16'
    height='16'
    fill='currentColor'
    xmlnsXlink='http://www.w3.org/1999/xlink'
  >
    <path d='M849.2 80H267.7c-73.8 0.1-133.6 58.2-133.6 129.9v606.7c0.1 70.3 58.6 127.2 130.9 127.3h584.3c22.5 0 40.8-17.8 40.8-39.7V119.6C890 97.8 871.7 80 849.2 80z m-40.9 784.6H264.8c-27.2 0-49.2-21.5-49.2-47.9s22-47.9 49.2-47.9h543.5v95.8z m0-175.1H264.8c-16.9 0-33.6 3.1-49.2 9.3V209.9c0-27.9 23.3-50.5 52-50.6h276.8v224.4c0 5.9 6.3 9.8 11.6 7.2l67.7-33.8c4.5-2.3 9.8-2.3 14.3 0l67.7 33.8c5.3 2.7 11.6-1.2 11.6-7.2V159.4h91.1l-0.1 530.1z'></path>
  </svg>
);

export const ImageSvg = (
  <svg
    className='icon'
    viewBox='0 0 1024 1024'
    version='1.1'
    xmlns='http://www.w3.org/2000/svg'
    width='16'
    height='16'
  >
    <path
      d='M85.312 85.312h853.376v853.376H85.312V85.312z m85.376 768h579.648L384 487.04l-213.312 213.376v152.96z m682.624-17.664V170.688H170.688v408.96L384 366.336l469.312 469.312z m-179.328-526.336a42.688 42.688 0 1 0 0 85.376 42.688 42.688 0 0 0 0-85.376z m-128 42.688a128 128 0 1 1 256 0 128 128 0 0 1-256 0z'
      fill='currentColor'
    ></path>
  </svg>
);

export const EmptySvg = (
  <svg
    viewBox='0 0 79 86'
    version='1.1'
    xmlns='http://www.w3.org/2000/svg'
    xmlnsXlink='http://www.w3.org/1999/xlink'
  >
    <defs>
      <linearGradient
        id='linearGradient-1-el-id-655-578'
        x1='38.8503086%'
        y1='0%'
        x2='61.1496914%'
        y2='100%'
      >
        <stop stopColor='var(--el-empty-fill-color-1)' offset='0%'></stop>
        <stop stopColor='var(--el-empty-fill-color-4)' offset='100%'></stop>
      </linearGradient>
      <linearGradient
        id='linearGradient-2-el-id-655-578'
        x1='0%'
        y1='9.5%'
        x2='100%'
        y2='90.5%'
      >
        <stop stopColor='var(--el-empty-fill-color-1)' offset='0%'></stop>
        <stop stopColor='var(--el-empty-fill-color-6)' offset='100%'></stop>
      </linearGradient>
      <rect id='path-3-el-id-655-578' x='0' y='0' width='17' height='36'></rect>
    </defs>
    <g
      id='Illustrations'
      stroke='none'
      strokeWidth='1'
      fill='none'
      fillRule='evenodd'
    >
      <g id='B-type' transform='translate(-1268.000000, -535.000000)'>
        <g id='Group-2' transform='translate(1268.000000, 535.000000)'>
          <path
            id='Oval-Copy-2'
            d='M39.5,86 C61.3152476,86 79,83.9106622 79,81.3333333 C79,78.7560045 57.3152476,78 35.5,78 C13.6847524,78 0,78.7560045 0,81.3333333 C0,83.9106622 17.6847524,86 39.5,86 Z'
            fill='var(--el-empty-fill-color-3)'
          ></path>
          <polygon
            id='Rectangle-Copy-14'
            fill='var(--el-empty-fill-color-7)'
            transform='translate(27.500000, 51.500000) scale(1, -1) translate(-27.500000, -51.500000) '
            points='13 58 53 58 42 45 2 45'
          ></polygon>
          <g
            id='Group-Copy'
            transform='translate(34.500000, 31.500000) scale(-1, 1) rotate(-25.000000) translate(-34.500000, -31.500000) translate(7.000000, 10.000000)'
          >
            <polygon
              id='Rectangle-Copy-10'
              fill='var(--el-empty-fill-color-7)'
              transform='translate(11.500000, 5.000000) scale(1, -1) translate(-11.500000, -5.000000) '
              points='2.84078316e-14 3 18 3 23 7 5 7'
            ></polygon>
            <polygon
              id='Rectangle-Copy-11'
              fill='var(--el-empty-fill-color-5)'
              points='-3.69149156e-15 7 38 7 38 43 -3.69149156e-15 43'
            ></polygon>
            <rect
              id='Rectangle-Copy-12'
              fill='var(--el-empty-fill-color-3)'
              transform='translate(46.500000, 25.000000) scale(-1, 1) translate(-46.500000, -25.000000) '
              x='38'
              y='7'
              width='17'
              height='36'
            ></rect>
            <polygon
              id='Rectangle-Copy-13'
              fill='var(--el-empty-fill-color-2)'
              transform='translate(39.500000, 3.500000) scale(-1, 1) translate(-39.500000, -3.500000) '
              points='24 7 41 7 55 -3.63806207e-12 38 -3.63806207e-12'
            ></polygon>
          </g>
          <rect
            id='Rectangle-Copy-15'
            fill='var(--el-empty-fill-color-2)'
            x='13'
            y='45'
            width='40'
            height='36'
          ></rect>
          <g id='Rectangle-Copy-17' transform='translate(53.000000, 45.000000)'>
            <use
              id='Mask'
              fill='var(--el-empty-fill-color-8)'
              transform='translate(8.500000, 18.000000) scale(-1, 1) translate(-8.500000, -18.000000) '
              xlinkHref='#path-3-el-id-655-578'
            ></use>
            <polygon
              id='Rectangle-Copy'
              fill='var(--el-empty-fill-color-9)'
              mask='var(--el-empty-fill-color-5)'
              transform='translate(12.000000, 9.000000) scale(-1, 1) translate(-12.000000, -9.000000) '
              points='7 0 24 0 20 18 7 16.5'
            ></polygon>
          </g>
          <polygon
            id='Rectangle-Copy-18'
            fill='var(--el-empty-fill-color-2)'
            transform='translate(66.000000, 51.500000) scale(-1, 1) translate(-66.000000, -51.500000) '
            points='62 45 79 45 70 58 53 58'
          ></polygon>
        </g>
      </g>
    </g>
  </svg>
);
