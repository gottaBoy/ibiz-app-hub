import { defineComponent } from 'vue';

export const CustomButton1 = defineComponent({
  name: 'CustomButton1',
  render() {
    return (
      <svg
        viewBox='0 0 187 38'
        preserveAspectRatio='none'
        class='dv-button-svg'
        fill='currentColor'
      >
        <g style='transform: translate(2px, 2px);'>
          <g>
            <path
              data-type='shape'
              d='M0,0 L0,34 L168,34 L183,19 L183,0'
              class='dv-button-svg-bg'
            />
          </g>
          <path
            data-type='polyline'
            d='M0,34 L168,34 L183,19'
            class='dv-button-svg-line'
          />
        </g>
      </svg>
    );
  },
});
