import {
  PropType,
  defineComponent,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue';
import loader from '@monaco-editor/loader';
import { useNamespace, useUIStore } from '@ibiz-template/vue3-util';
import './view-model-viewer.scss';
import { IAppView } from '@ibiz/model-core';
import interact from 'interactjs';
import { CenterController } from '../../controller/center.controller';

type LoaderMonaco = Awaited<ReturnType<typeof loader.init>>;

export const ViewModelViewer = defineComponent({
  name: 'DevToolViewModelViewer',
  props: {
    view: {
      type: Object as PropType<IAppView>,
      required: true,
    },
    center: {
      type: Object as PropType<CenterController>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('view-model-viewer');

    const { center } = props;

    const currentVal = ref<string>('');

    let editor: ReturnType<LoaderMonaco['editor']['create']>;
    let monacoEditor: LoaderMonaco['editor'];
    const { UIStore } = useUIStore();

    // 编辑器主题
    const getMonacoTheme = (name: string): string => {
      return name === 'dark' ? `vs-${UIStore.theme}` : 'vs'; // 官方自带三种主题vs, hc-black, or vs-dark
    };

    watch(
      () => UIStore.theme,
      newVal => {
        monacoEditor.setTheme(getMonacoTheme(newVal));
      },
    );

    watch(
      () => props.view,
      newVal => {
        if (newVal) {
          const newStr = JSON.stringify(newVal, null, 2);
          if (newStr !== currentVal.value) {
            currentVal.value = newStr || '';
            editor?.setValue(currentVal.value);
          }
        }
      },
      { immediate: true },
    );

    const codeEditBox = ref();
    const dragBox = ref();
    const isLoading = ref(true);

    const editorInit = (): void => {
      nextTick(() => {
        loader.config({
          paths: {
            vs: `${ibiz.env.pluginBaseUrl}/monaco-editor@0.45.0/min/vs`,
          },
        });
        loader.init().then(loaderMonaco => {
          isLoading.value = false;
          // 初始化编辑器
          if (!editor) {
            monacoEditor = loaderMonaco.editor;
            editor = monacoEditor.create(codeEditBox.value, {
              language: 'json', // 语言支持自行查阅demo
              theme: getMonacoTheme(UIStore.theme),
              foldingStrategy: 'indentation',
              renderLineHighlight: 'all', // 行亮
              selectOnLineNumbers: true, // 显示行号
              minimap: {
                enabled: true,
              },
              readOnly: true, // 只读
              fontSize: 16, // 字体大小
              scrollBeyondLastLine: false, // 取消代码后面一大段空白
              overviewRulerBorder: false, // 不要滚动条的边框
            });
          }
          setTimeout(() => {
            editor.layout();
            editor.setValue(currentVal.value);
          });

          window.addEventListener('resize', () => {
            editor.layout();
          });
        });
      });
    };

    const interactDom = (): void => {
      if (codeEditBox.value) {
        // 从config里取配置的宽度
        if (center.config.modelPreviewWidth) {
          codeEditBox.value.style.setProperty(
            ns.cssVarBlockName('width'),
            `${center.config.modelPreviewWidth}px`,
          );
        }
        // 绑定DOM拖动
        interact(codeEditBox.value).resizable({
          edges: { left: true },
          listeners: {
            move(event) {
              const { width } = event.rect;
              // 设置css变量
              codeEditBox.value.style.setProperty(
                ns.cssVarBlockName('width'),
                `${width}px`,
              );
              editor.layout();
              // 更新用户配置，存localStorage
              center.updateUserConfig({
                modelPreviewWidth: width,
              });
            },
          },
        });
      }
    };

    onMounted(() => {
      editorInit();
      interactDom();
    });

    onUnmounted(() => {
      editor?.dispose();
    });

    return { ns, currentVal, codeEditBox, isLoading, dragBox };
  },
  render() {
    return (
      <div class={[this.ns.b()]} ref='dragBox' v-loading={this.isLoading}>
        <div class={[this.ns.b('drag')]}>
          {!this.isLoading && (
            <ion-icon
              name='swap-horizontal-outline'
              class={this.ns.b('drag-icon')}
            ></ion-icon>
          )}
        </div>
        <div ref='codeEditBox' class={[this.ns.b('editor')]}></div>
      </div>
    );
  },
});
