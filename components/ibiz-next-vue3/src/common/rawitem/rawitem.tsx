import { useNamespace } from '@ibiz-template/vue3-util';
import { defineComponent, PropType, Ref, ref, watch } from 'vue';
import { createUUID } from 'qx-util';
import {
  IHtmlItem,
  IPanelRawItem,
  IRawItemContainer,
  ISysImage,
  ITextItem,
  IUnkownItem,
} from '@ibiz/model-core';
import { isBase64, isBase64Image, isSvg } from '@ibiz-template/core';
import './rawitem.scss';
import { parseHtml } from '../../util';

export const IBizRawItem = defineComponent({
  name: 'IBizRawItem',
  props: {
    type: {
      type: String,
      required: false,
    },
    content: {
      type: [String, Object, Number],
    },
    rawItem: {
      type: Object as PropType<IRawItemContainer>,
      required: false,
    },
  },
  setup(props) {
    const ns = useNamespace('rawitem');
    let rawItem = null;
    let contentType = '';
    if (props.rawItem) {
      rawItem = props.rawItem.rawItem!;
      contentType = rawItem.contentType!;
    }
    const rawItemType = ref(props.type || contentType || '');
    const rawItemContent: Ref<string | number | IData> = ref('');
    let sysImage: ISysImage | undefined;
    if (contentType === 'IMAGE') {
      sysImage = (rawItem as IPanelRawItem).sysImage;
    }
    // 传入内容
    if (contentType === 'RAW' || contentType === 'HTML') {
      if (contentType === 'RAW') {
        rawItemType.value = 'TEXT';
        rawItemContent.value = (rawItem as ITextItem).caption!;
      } else {
        rawItemContent.value = (rawItem as IHtmlItem).content!;
      }
    } else if (['INFO', 'WARNING', 'ERROR'].includes(contentType!)) {
      rawItemContent.value = (rawItem as IUnkownItem).rawContent!;
    } else if (['VIDEO', 'DIVIDER'].includes(contentType!)) {
      // 暂不处理
    } else if (contentType === 'IMAGE' && sysImage) {
      rawItemContent.value = sysImage;
    }

    // 判断传入是否为图片路径
    const isImg = (imgUrl: string) => {
      const reg =
        /^https?:|^http?:|(\.png|\.svg|\.jpg|\.png|\.gif|\.psd|\.tif|\.bmp|\.jpeg)/;
      return reg.test(imgUrl);
    };

    // 判断传入是否为图标图片路径
    const isImagePath = (content: string) => {
      return (
        isImg(content) ||
        isBase64Image(content) ||
        isBase64(content) ||
        isSvg(content)
      );
    };

    // 判断传入是否为html字符
    const isHtmlStr = (str: string) => {
      try {
        const fragment = new DOMParser().parseFromString(str, 'text/html');
        return fragment.body.children.length > 0;
      } catch (error) {
        return false;
      }
    };

    // 视频类型内容参数
    const playerParams = ref({
      id: createUUID(),
      path: '',
      mute: true,
      autoplay: true,
      replay: false,
      showcontrols: true,
    });

    // 分割线类型参数
    const dividerParams = ref({
      contentPosition: 'center',
      html: '',
    });

    // 类型参数
    const alertParams = ref({
      type: 'info',
      title: '',
      closeabled: true,
      showIcon: false,
    });

    // 文本类型显示值
    const rawItemText: Ref<string | number | IData> = ref('');

    // 转换各类值操作
    const convertValue = () => {
      // 图片类型
      if (rawItemType.value === 'IMAGE') {
        if (props.content && typeof props.content === 'string') {
          if (isImagePath(props.content)) {
            rawItemContent.value = { imagePath: props.content };
          } else {
            rawItemContent.value = { cssClass: props.content };
          }
        } else if (sysImage) {
          rawItemContent.value = sysImage;
        }
      }

      // 文本类型
      if (
        [
          'TEXT',
          'HEADING1',
          'HEADING2',
          'HEADING3',
          'HEADING4',
          'HEADING5',
          'HEADING6',
          'PARAGRAPH',
          'HTML',
          'RAW',
        ].includes(rawItemType.value)
      ) {
        rawItemText.value = rawItemContent.value;
        if (typeof rawItemText.value === 'string') {
          const val = rawItemText.value;
          rawItemText.value = val
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;nbsp;/g, ' ')
            .replace(/&nbsp;/g, ' ');
        }
      }

      // 适配html类型但并非html字符串换行符识别异常
      if (
        rawItemType.value === 'HTML' &&
        !isHtmlStr(rawItemText.value as string)
      ) {
        rawItemText.value = (rawItemText.value as string).replace(
          /\n/g,
          '<br>',
        );
      }
      // 解析表情内容
      if (rawItemType.value === 'HTML') {
        rawItemText.value = parseHtml(rawItemText.value as string);
      }

      if (
        ['VIDEO', 'DIVIDER', 'INFO', 'WARNING', 'ERROR'].includes(
          rawItemType.value,
        )
      ) {
        if (rawItemContent.value) {
          let rawConfig = {};
          try {
            if (typeof rawItemContent.value === 'string') {
              // eslint-disable-next-line no-new-func
              const func = new Function(`return (${rawItemContent.value});`);
              rawConfig = func();
              switch (rawItemType.value) {
                case 'VIDEO':
                  Object.assign(playerParams.value, rawConfig);
                  break;
                case 'DIVIDER':
                  Object.assign(dividerParams.value, rawConfig);
                  break;
                case 'INFO':
                case 'WARNING':
                case 'ERROR':
                  alertParams.value.type =
                    rawItemType.value.toLocaleLowerCase();
                  Object.assign(alertParams.value, rawConfig);
                  break;
                default:
                  break;
              }
            }
          } catch {
            ibiz.log.error(
              ibiz.i18n.t('component.rawItem.errorConfig', {
                type: rawItemType.value,
              }),
            );
          }
        }
      }
    };

    // 模板模式下默认不绘制模板代码
    if (!props.rawItem?.rawItem?.templateMode) {
      convertValue();
    }

    watch(
      () => props.content,
      (newVal, oldVal) => {
        if (newVal && newVal !== oldVal) {
          rawItemContent.value = newVal as string | number;
          convertValue();
        }
      },
      {
        immediate: true,
      },
    );

    return {
      ns,
      rawItemText,
      playerParams,
      dividerParams,
      alertParams,
      rawItemType,
      rawItemContent,
    };
  },
  render() {
    const renderContent = () => {
      if (this.rawItemType === 'IMAGE') {
        return (
          <i-biz-icon
            class={[this.ns.e('image')]}
            icon={this.rawItemContent}
          ></i-biz-icon>
        );
      }
      if (this.rawItemType === 'TEXT' || this.rawItemType === 'RAW') {
        return <span class={this.ns.e('text')}>{this.rawItemText}</span>;
      }
      if (this.rawItemType === 'HEADING1') {
        return <h1 class={this.ns.e('h1')}>{this.rawItemText}</h1>;
      }
      if (this.rawItemType === 'HEADING2') {
        return <h2 class={this.ns.e('h2')}>{this.rawItemText}</h2>;
      }
      if (this.rawItemType === 'HEADING3') {
        return <h3 class={this.ns.e('h3')}>{this.rawItemText}</h3>;
      }
      if (this.rawItemType === 'HEADING4') {
        return <h4 class={this.ns.e('h4')}>{this.rawItemText}</h4>;
      }
      if (this.rawItemType === 'HEADING5') {
        return <h5 class={this.ns.e('h5')}>{this.rawItemText}</h5>;
      }
      if (this.rawItemType === 'HEADING6') {
        return <h6 class={this.ns.e('h6')}>{this.rawItemText}</h6>;
      }
      if (this.rawItemType === 'PARAGRAPH') {
        return <p class={this.ns.e('paragraph')}>{this.rawItemText}</p>;
      }
      if (this.rawItemType === 'HTML') {
        return (
          <div class={this.ns.e('paragraph')} v-html={this.rawItemText}></div>
        );
      }
      if (this.rawItemType === 'VIDEO') {
        return (
          <div class={this.ns.e('video')}>
            <video
              id={this.playerParams.id}
              src={this.playerParams.path}
              autoplay={this.playerParams.autoplay}
              controls={this.playerParams.showcontrols}
              loop={this.playerParams.replay}
              muted={this.playerParams.mute}
            >
              <source src={this.playerParams.path} type='video/mp4' />
              <source src={this.playerParams.path} type='video/ogg' />
              <source src={this.playerParams.path} type='video/webm' />
              {ibiz.i18n.t('component.rawItem.noSupportVideo')}
            </video>
          </div>
        );
      }
      if (this.rawItemType === 'DIVIDER') {
        return (
          <el-divider content-position={this.dividerParams.contentPosition}>
            <span v-html={this.dividerParams.html}></span>
          </el-divider>
        );
      }
      if (
        this.rawItemType === 'INFO' ||
        this.rawItemType === 'WARNING' ||
        this.rawItemType === 'ERROR'
      ) {
        return (
          <el-alert
            title={this.alertParams.title}
            type={this.alertParams.type}
            show-icon={this.alertParams.showIcon}
            closable={this.alertParams.closeabled}
          ></el-alert>
        );
      }
      if (this.rawItemType === 'MARKDOWN') {
        return (
          <iBizMarkDown value={this.content} disabled={true}></iBizMarkDown>
        );
      }
      if (['PLACEHOLDER'].includes(this.rawItemType)) {
        return null;
      }
      return null;
    };

    return (
      <div class={this.ns.b()} title={this.rawItem?.rawItem?.tooltip}>
        {renderContent()}
      </div>
    );
  },
});
