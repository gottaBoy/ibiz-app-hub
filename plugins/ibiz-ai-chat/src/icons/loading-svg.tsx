export const LoadingSvg = (props: { className?: string }) => (
  <svg
    className={props.className}
    width='16'
    height='16'
    viewBox='0 0 50 50'
    xmlns='http://www.w3.org/2000/svg'
  >
    <circle
      cx='25'
      cy='25'
      r='20'
      stroke='currentColor'
      strokeWidth='5'
      fill='none'
      strokeDasharray='31.415, 31.415'
      strokeLinecap='round'
    >
      <animateTransform
        attributeName='transform'
        type='rotate'
        from='0 25 25'
        to='360 25 25'
        dur='1s'
        repeatCount='indefinite'
      />
    </circle>
  </svg>
);

export const LoadingIcon = () => (
  <svg
    className='icon'
    viewBox='0 0 1024 1024'
    version='1.1'
    xmlns='http://www.w3.org/2000/svg'
    width='16'
    height='16'
  >
    <path
      d='M512 61.44a40.96 40.96 0 0 1 40.96 40.96v122.88a40.96 40.96 0 1 1-81.92 0V102.4A40.96 40.96 0 0 1 512 61.44z'
      fill='currentColor'
      opacity='.9'
    ></path>
    <path
      d='M737.28 121.792a40.96 40.96 0 0 1 14.992 55.952l-61.44 106.432a40.96 40.96 0 1 1-70.944-40.96l61.44-106.432a40.96 40.96 0 0 1 55.952-14.992z'
      fill='currentColor'
      opacity='.8'
    ></path>
    <path
      d='M902.208 286.72a40.96 40.96 0 0 1-14.992 55.952l-106.432 61.44a40.96 40.96 0 0 1-40.96-70.944l106.432-61.44a40.96 40.96 0 0 1 55.952 14.992z'
      fill='currentColor'
      opacity='.76'
    ></path>
    <path
      d='M962.56 512a40.96 40.96 0 0 1-40.96 40.96h-122.88a40.96 40.96 0 1 1 0-81.92h122.88A40.96 40.96 0 0 1 962.56 512z'
      fill='currentColor'
      opacity='.7'
    ></path>
    <path
      d='M902.208 737.28a40.96 40.96 0 0 1-55.952 14.992l-106.432-61.44a40.96 40.96 0 1 1 40.96-70.944l106.432 61.44a40.96 40.96 0 0 1 14.992 55.952z'
      fill='currentColor'
      opacity='.6'
    ></path>
    <path
      d='M737.28 902.208a40.96 40.96 0 0 1-55.952-14.992l-61.44-106.432a40.96 40.96 0 0 1 70.944-40.96l61.44 106.432a40.96 40.96 0 0 1-14.992 55.952z'
      fill='currentColor'
      opacity='.5'
    ></path>
    <path
      d='M512 962.56a40.96 40.96 0 0 1-40.96-40.96v-122.88a40.96 40.96 0 1 1 81.92 0v122.88A40.96 40.96 0 0 1 512 962.56z'
      fill='currentColor'
      opacity='.4'
    ></path>
    <path
      d='M286.72 902.208a40.96 40.96 0 0 1-14.992-55.952l61.44-106.432a40.96 40.96 0 1 1 70.944 40.96l-61.44 106.432a40.96 40.96 0 0 1-55.952 14.992z'
      fill='currentColor'
      opacity='.3'
    ></path>
    <path
      d='M121.792 737.28a40.96 40.96 0 0 1 14.992-55.952l106.432-61.44a40.96 40.96 0 0 1 40.96 70.944l-106.432 61.44a40.96 40.96 0 0 1-55.952-14.992z'
      fill='currentColor'
      opacity='.2'
    ></path>
    <path
      d='M61.44 512a40.96 40.96 0 0 1 40.96-40.96h122.88a40.96 40.96 0 1 1 0 81.92H102.4A40.96 40.96 0 0 1 61.44 512z'
      fill='currentColor'
      opacity='.1'
    ></path>
    <path
      d='M121.792 286.72a40.96 40.96 0 0 1 55.952-14.992l106.432 61.44a40.96 40.96 0 1 1-40.96 70.944l-106.432-61.44a40.96 40.96 0 0 1-14.992-55.952z'
      fill='currentColor'
      opacity='.04'
    ></path>
    <path
      d='M286.72 121.792a40.96 40.96 0 0 1 55.952 14.992l61.44 106.432a40.96 40.96 0 0 1-70.944 40.96l-61.44-106.432a40.96 40.96 0 0 1 14.992-55.952z'
      fill='currentColor'
    ></path>
  </svg>
);
