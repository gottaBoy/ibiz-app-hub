import { AppMenuController } from '@ibiz-template/runtime';
import { useNamespace, useUIStore } from '@ibiz-template/vue3-util';
import {
  computed,
  defineComponent,
  getCurrentInstance,
  nextTick,
  onMounted,
  onUnmounted,
  PropType,
  ref,
  watch,
} from 'vue';
import { showTitle } from '@ibiz-template/core';
import * as monaco from 'monaco-editor';
import loader from '@monaco-editor/loader';
import { CustomThemeController } from './custom-theme.controller';
import './custom-theme.scss';

export const CustomTheme = defineComponent({
  name: 'IBizCustomTheme',
  props: {
    controller: {
      type: Object as PropType<AppMenuController>,
      required: true,
    },
  },
  emits: [],
  setup() {
    const ns = useNamespace(`custom-theme`);

    const vue = getCurrentInstance()!.proxy!;

    const c = new CustomThemeController();

    const activeTab = ref(0);

    const codeEditRef = ref();

    const currentVal = ref<string>('');

    const isEditMode = ref(false);

    let editor: monaco.editor.IStandaloneCodeEditor | null;
    let monacoEditor: typeof monaco.editor;

    const { UIStore } = useUIStore();
    const getMonacoTheme = (name: string): string => {
      return name === 'dark' ? `vs-${UIStore.theme}` : 'vs'; // 官方自带三种主题vs, hc-black, or vs-dark
    };
    watch(
      () => UIStore.theme,
      newVal => {
        monacoEditor.setTheme(getMonacoTheme(newVal));
      },
    );

    /** 代码编辑器初始化 */
    const editorInit = (): void => {
      nextTick(() => {
        loader.config({
          paths: {
            vs: `${ibiz.env.pluginBaseUrl}/monaco-editor@0.52.2/min/vs`,
          },
        });
        loader.init().then(loaderMonaco => {
          // 初始化编辑器
          if (!editor) {
            monacoEditor = loaderMonaco.editor;
            editor = monacoEditor.create(codeEditRef.value, {
              language: 'json', // 语言支持自行查阅demo
              theme: getMonacoTheme(UIStore.theme),
              foldingStrategy: 'indentation',
              renderLineHighlight: 'all', // 行亮
              selectOnLineNumbers: true, // 显示行号
              minimap: {
                enabled: true,
              },
              fontSize: 16, // 字体大小
              scrollBeyondLastLine: false, // 取消代码后面一大段空白
              overviewRulerBorder: false, // 不要滚动条的边框
            });
          }
          setTimeout(() => {
            editor!.layout();
            editor!.setValue(currentVal.value);
          });

          window.addEventListener('resize', () => {
            editor!.layout();
          });
        });
      });
    };

    onMounted(() => {
      editorInit();
    });

    onUnmounted(() => {
      editor?.dispose();
    });

    // 是否显示保存和分享
    const showSaveAndShare = computed(() => {
      if (ibiz.appData) {
        // 超管员
        if (ibiz.appData.enablepermissionvalid === false) {
          return true;
        }
        // 具有APP_THEME统一资源的人员
        if (ibiz.appData.unires.length) {
          const targetUnire = ibiz.appData.unires.find((unire: string) => {
            return unire === 'UNIRES_CLOUD_CONF_CONFIG_SHARE';
          });
          if (targetUnire) {
            return true;
          }
        }
      }
      return false;
    });

    /**
     * 主题类型变更
     *
     * @author tony001
     * @date 2024-12-26 16:12:06
     * @param {string} codeName
     */
    const handleThemeChange = async (codeName: string) => {
      await c.handleThemeChange(codeName);
      if (isEditMode.value) {
        const result = c.getModelEditData();
        nextTick(() => {
          currentVal.value = JSON.stringify(result, null, 2);
          editor?.setValue(currentVal.value);
          editor?.layout();
        });
      }
      vue.$forceUpdate();
    };

    /**
     * 颜色变更
     *
     * @author tony001
     * @date 2024-12-26 16:12:11
     * @param {string} varName
     * @param {string} color
     * @param {string} [className]
     */
    const handleColorChange = (
      varName: string,
      color: string,
      className?: string,
    ) => {
      let name = varName;
      if (className) {
        name = `${className}:${varName}`;
      }
      c.state.themeVars[name] = color;
    };

    /**
     * 字体大小变更
     *
     * @author tony001
     * @date 2024-12-26 16:12:29
     * @param {string} varName
     * @param {number} size
     * @param {IData} item
     */
    const handleSizeChange = (varName: string, size: number, item: IData) => {
      c.calcSizeChange(varName, size, item);
    };

    /**
     * 处理主题预览
     *
     * @author tony001
     * @date 2024-12-26 17:12:25
     */
    const handlePreview = async () => {
      if (isEditMode.value && editor) {
        await c.computeChangeThemeVars(JSON.parse(editor.getValue()));
      }
      await c.handleThemePreview(false);
      vue.$forceUpdate();
    };

    /**
     * 处理主题保存
     *
     * @author tony001
     * @date 2024-12-26 17:12:18
     */
    const handleSave = async () => {
      if (isEditMode.value && editor) {
        await c.computeChangeThemeVars(JSON.parse(editor.getValue()));
      }
      await c.handleThemeSave(false);
      vue.$forceUpdate();
    };

    /**
     * 处理主题保存并分享
     *
     * @author tony001
     * @date 2024-12-26 18:12:21
     */
    const handleSaveAndShare = async () => {
      if (isEditMode.value && editor) {
        await c.computeChangeThemeVars(JSON.parse(editor.getValue()));
      }
      await c.handleThemeSave(true);
      vue.$forceUpdate();
    };

    /**
     * 处理主题重置
     *
     * @author tony001
     * @date 2024-12-26 17:12:43
     */
    const handleReset = async () => {
      await c.handleThemeReset(false);
      if (isEditMode.value) {
        const result = c.getModelEditData();
        nextTick(() => {
          currentVal.value = JSON.stringify(result, null, 2);
          editor?.setValue(currentVal.value);
          editor?.layout();
        });
      }
      vue.$forceUpdate();
    };

    /**
     * 处理主题重置并分享
     *
     * @author tony001
     * @date 2024-12-27 19:12:11
     */
    const handleResetAndShare = async () => {
      await c.handleThemeReset(true);
      if (isEditMode.value) {
        const result = c.getModelEditData();
        nextTick(() => {
          currentVal.value = JSON.stringify(result, null, 2);
          editor?.setValue(currentVal.value);
          editor?.layout();
        });
      }
      vue.$forceUpdate();
    };

    const getVarLabel = (item: IData) => {
      if (item.labelLang) {
        return ibiz.i18n.t(`control.common.customTheme.${item.labelLang}`);
      }
      return item.label;
    };

    // 预置颜色
    const predefineColors = ref([
      'rgb(241, 4, 4)',
      'rgb(242, 76, 4)',
      'rgb(238, 153, 33)',
      'rgb(98, 230, 10)',
      'rgb(10, 230, 164)',
      'rgb(3, 144, 245)',
      'rgb(3, 7, 245)',
      'rgb(108, 3, 245)',
      'rgb(245, 3, 241)',
      'rgb(245, 3, 92)',
    ]);

    /**
     * 颜色选择
     *
     * @author tony001
     * @date 2024-12-26 18:12:53
     * @param {IData} data
     * @return {*}
     */
    const renderColorPicker = (data: IData) => {
      let { value } = data;
      if (data.className) {
        value = `${data.className}:${value}`;
      }
      return (
        <el-color-picker
          predefine={predefineColors.value}
          onChange={(val: string) => {
            handleColorChange(data.value, val, data.className);
          }}
          show-alpha
          model-value={c.getCssVar(value, data.defaultValue)}
        />
      );
    };

    /**
     * 字体大小
     *
     * @author tony001
     * @date 2024-12-26 18:12:13
     * @param {IData} data
     * @return {*}
     */
    const renderSizeInput = (data: IData) => {
      const varValue = c.getCssVar(data.value) as number;
      return (
        <el-input-number
          model-value={varValue}
          step={varValue >= 100 ? 100 : 1}
          min={0}
          onChange={(value: number) => {
            handleSizeChange(data.value, value, data);
          }}
        />
      );
    };

    /**
     * 绘制项
     *
     * @author tony001
     * @date 2024-12-26 18:12:24
     * @param {IData} item
     * @return {*}
     */
    const renderItem = (item: IData) => {
      if (item.children) {
        return item.children.map((children: IData) => {
          return renderItem(children);
        });
      }
      return (
        <div class={ns.b('item')}>
          <div class={ns.be('item', 'caption')}>{getVarLabel(item)}</div>
          <div class={ns.be('item', 'content')}>
            {item.vars.map((data: IData) => {
              let content = renderColorPicker(data);
              if (data.type === 'size') {
                content = renderSizeInput(data);
              }
              return (
                <div class={ns.b('var')}>
                  <span
                    class={ns.be('var', 'description')}
                    title={showTitle(
                      ibiz.i18n.t(
                        `control.common.customTheme.${data.descLang}`,
                      ),
                    )}
                  >
                    {getVarLabel(data)}
                  </span>
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    /**
     * 处理高级配置
     *
     * @author tony001
     * @date 2024-12-27 10:12:51
     */
    const handAdvancedSetting = async () => {
      const tempIsEditMode = !isEditMode.value;
      if (isEditMode.value) {
        if (editor) {
          await c.computeChangeThemeVars(JSON.parse(editor.getValue()));
        }
        isEditMode.value = tempIsEditMode;
        vue.$forceUpdate();
      } else {
        const result = c.getModelEditData();
        isEditMode.value = tempIsEditMode;
        nextTick(() => {
          currentVal.value = JSON.stringify(result, null, 2);
          editor?.setValue(currentVal.value);
          editor?.layout();
          vue.$forceUpdate();
        });
      }
    };

    /**
     * 绘制高级配置
     *
     * @author tony001
     * @date 2024-12-27 10:12:36
     * @return {*}
     */
    const renderAdvancedSetting = () => {
      return (
        <span
          class={ns.b('content-setting')}
          onClick={() => {
            handAdvancedSetting();
          }}
        >
          {isEditMode.value
            ? ibiz.i18n.t('control.common.customTheme.closeModelEdit')
            : ibiz.i18n.t('control.common.customTheme.modelEdit')}
        </span>
      );
    };

    /**
     * 绘制头
     *
     * @author tony001
     * @date 2024-12-26 18:12:41
     * @return {*}
     */
    const renderHeader = () => {
      return (
        <div class={ns.b('item')}>
          <div class={ns.be('item', 'caption')}>
            {ibiz.i18n.t('control.common.customTheme.themeColor')}
          </div>
          <div class={ns.be('item', 'container')}>
            <div class={ns.be('item', 'content')}>
              {c.predefineType.map((item: IData) => {
                return (
                  <el-button
                    color={item.color}
                    title={showTitle(getVarLabel(item))}
                    onClick={() => {
                      handleThemeChange(item.codeName);
                    }}
                  >
                    {c.state.themeTag === item.codeName && (
                      <ion-icon name='checkmark-sharp'></ion-icon>
                    )}
                  </el-button>
                );
              })}
            </div>
            {renderAdvancedSetting()}
          </div>
        </div>
      );
    };

    /**
     * 绘制内容
     *
     * @author tony001
     * @date 2024-12-26 18:12:53
     * @return {*}
     */
    const renderContent = () => {
      return (
        <div class={ns.b('content-container')}>
          <div
            ref={codeEditRef}
            class={[ns.b('edit-container'), ns.is('hidden', !isEditMode.value)]}
          ></div>
          <div
            class={[
              ns.b('default-container'),
              ns.is('hidden', isEditMode.value),
            ]}
          >
            <el-tabs v-model={activeTab.value}>
              {c.model.map((item: IData, index: number) => {
                return (
                  <el-tab-pane name={index} label={getVarLabel(item)}>
                    {renderItem(item)}
                  </el-tab-pane>
                );
              })}
            </el-tabs>
          </div>
        </div>
      );
    };

    return {
      ns,
      c,
      showSaveAndShare,
      handlePreview,
      handleReset,
      handleSave,
      handleSaveAndShare,
      handleResetAndShare,
      renderHeader,
      renderContent,
    };
  },

  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.b('header')}>{this.renderHeader()}</div>
        <div class={this.ns.b('content')}>{this.renderContent()}</div>
        <div class={this.ns.b('footer')}>
          <el-button onClick={this.handlePreview}>
            {ibiz.i18n.t('control.common.customTheme.preview')}
          </el-button>
          <el-button onClick={this.handleSave}>
            {ibiz.i18n.t('control.common.customTheme.save')}
          </el-button>
          <el-button onClick={this.handleReset}>
            {ibiz.i18n.t('control.common.customTheme.reset')}
          </el-button>
          {this.showSaveAndShare && (
            <el-dropdown split-button type='primary' trigger='click'>
              {{
                default: () => {
                  return ibiz.i18n.t(
                    'control.common.customTheme.adminOperation',
                  );
                },
                dropdown: () => {
                  return (
                    <el-dropdown-menu>
                      <el-dropdown-item>
                        <span onClick={this.handleSaveAndShare}>
                          {ibiz.i18n.t(
                            'control.common.customTheme.saveAndShare',
                          )}
                        </span>
                      </el-dropdown-item>
                      <el-dropdown-item>
                        <span onClick={this.handleResetAndShare}>
                          {ibiz.i18n.t(
                            'control.common.customTheme.resetAndShare',
                          )}
                        </span>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  );
                },
              }}
            </el-dropdown>
          )}
        </div>
      </div>
    );
  },
});
