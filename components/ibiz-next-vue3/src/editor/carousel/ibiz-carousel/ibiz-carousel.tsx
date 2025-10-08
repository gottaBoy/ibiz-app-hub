/* eslint-disable no-nested-ternary */
import { Ref, defineComponent, ref, watch } from 'vue';
import {
  getEditorProps,
  getEditorEmits,
  useNamespace,
} from '@ibiz-template/vue3-util';
import './ibiz-carousel.scss';

import { CarouselEditorController } from '../carousel-editor.controller';

/**
 * 轮播图
 * @description 在有限空间内，循环播放图片内容。此为平台预置标准编辑器组件
 * @primary
 * @ignoreprops autoFocus | overflowMode | controlParams
 * @ignoreemits change | blur | focus | enter | infoTextChange
 */
export const IBizCarousel: ReturnType<typeof defineComponent> = defineComponent(
  {
    name: 'IBizCarousel',
    props: getEditorProps<CarouselEditorController>(),
    emits: getEditorEmits(),
    setup(props) {
      const ns = useNamespace('carousel');
      const c = props.controller;

      const editorModel = c!.model;

      const carouselData: Ref<
        {
          id: string;
          name: string;
          imgUrl?: string;
        }[]
      > = ref([]);

      const isAuto = ref(true);

      const timeSpan = ref(3000);

      // 值响应式变更
      // json: [{id:string ,name:string },{id:string ,name:string }]
      watch(
        () => props.value,
        newVal => {
          if (typeof newVal === 'string') {
            carouselData.value = !newVal ? [] : JSON.parse(newVal);
          }
        },
        { immediate: true },
      );

      /**
       * @description 获取下载路径,若业务数据中存在folder，则以业务数据中folder作为目录
       * @param {IData} data
       * @param {IData} file
       * @returns {*}  {string}
       */
      const getDownloadUrl = (data: IData, file: IData): string => {
        const editorParams = { ...c.editorParams };
        if (editorParams.exportparams) {
          editorParams.exportParams = JSON.parse(editorParams.exportparams);
        }
        if (file && file.folder) {
          editorParams.osscat = file.folder;
        }
        const urls = ibiz.util.file.calcFileUpDownUrl(
          c.context,
          c.params,
          data,
          editorParams,
        );
        return urls.downloadUrl;
      };

      watch(
        carouselData,
        newVal => {
          // 变更后且下载基础路径存在时解析
          if (newVal?.length) {
            newVal.forEach((carousel: IData) => {
              const downloadUrl = getDownloadUrl(props.data, carousel);
              carousel.imgUrl =
                carousel.imgUrl || downloadUrl.replace('%fileId%', carousel.id);
              if (ibiz.config.common.enableDownloadTicket) {
                ibiz.util.file
                  .getDownloadTicket(
                    c.context,
                    c.params,
                    props.data,
                    {
                      fileId: carousel.id,
                    },
                    c.downloadTicketParams,
                  )
                  .then(downloadTicket => {
                    if (downloadTicket && downloadTicket.ticket) {
                      carousel.imgUrl = downloadUrl.replace(
                        '%fileId%',
                        downloadTicket.ticket,
                      );
                    }
                  });
              }
            });
          }
        },
        { immediate: true },
      );

      return {
        ns,
        c,
        editorModel,
        carouselData,
        isAuto,
        timeSpan,
      };
    },
    render() {
      return (
        <div
          class={[
            this.ns.b(),
            this.disabled ? this.ns.m('disabled') : '',
            this.readonly ? this.ns.m('readonly') : '',
            this.ns.e(this.editorModel.editorType),
          ]}
        >
          <iBizCarouselComponent
            carouselData={this.carouselData}
            isAuto={this.isAuto}
            timeSpan={this.timeSpan}
            {...this.$attrs}
          />
        </div>
      );
    },
  },
);
