/* eslint-disable @typescript-eslint/no-explicit-any */
import { computed, defineComponent, nextTick, onUnmounted, ref } from 'vue';
import {
  useNamespace,
  getEditorEmits,
  getMapPickerProps,
} from '@ibiz-template/vue3-util';
import AMapLoader from '@amap/amap-jsapi-loader';
import { MapPickerEditorController } from '../map-picker-editor.controller';
import { IBizCommonRightIcon } from '../../common';
import './ibiz-map-picker.scss';

/**
 * 地图选择器
 *
 * @description 通过高德地图选择具体位置，然后填充名称、经度和纬度。支持编辑器类型包含：`地图选择器`
 * @primary
 * @editorparams {"name":"readonly","parameterType":"boolean","defaultvalue":false,"description":"设置编辑器是否为只读态"}
 * @ignoreprops autoFocus | overflowMode
 * @ignoreemits blur | focus | enter | infoTextChange
 */
export const IBizMapPicker: ReturnType<typeof defineComponent> =
  defineComponent({
    name: 'IBizMapPicker',
    props: getMapPickerProps<MapPickerEditorController>(),
    emits: getEditorEmits(),
    setup(props, { emit }) {
      const ns = useNamespace('map-picker');

      // 控制器
      const c = props.controller;

      // 值项
      const { editorItems } = c.model;

      // 经度
      let longitudeName = '';
      // 纬度
      let latitudeName = '';

      if (editorItems) {
        const [longitude, latitude] = editorItems;
        longitudeName = longitude.id || '';
        latitudeName = latitude.id || '';
      }

      // 输入框组件引用
      const inputRef = ref();

      // 搜索输入框元素
      const searchRef = ref();
      const searchInputRef = computed(() => {
        return searchRef.value?.$el.querySelector?.('input');
      });

      // 地图容器元素
      const mapContainerRef = ref<HTMLDivElement>();

      // 搜索结果容器元素
      const searchResultContainerRef = ref<HTMLDivElement>();

      // 对话框是否显示
      const dialogVisible = ref(false);

      // 是否正在加载中
      const isLoading = ref(false);

      // 搜索值
      const searchValue = ref('');

      // 地图对象
      let map: IData | undefined;

      // 标记对象
      let marker: IData | undefined;

      // poi选择器
      let poiPicker: IData | undefined;

      // 地址信息
      const addressInfo: {
        address: string;
        longitude?: number | null;
        latitude?: number | null;
      } = {
        address: '',
        longitude: null,
        latitude: null,
      };

      // 清除标记
      const clearMarker = () => {
        if (marker) {
          marker.setMap(null);
          marker = undefined;
        }
      };

      // 添加标记
      const addMarker = (lng: number, lat: number) => {
        const AMap = (window as IData).AMap;
        if (!AMap) {
          return;
        }
        clearMarker();
        marker = new AMap.Marker({
          position: [lng, lat],
        });
      };

      // 获取位置
      const getAddress = (lng: number, lat: number) => {
        const AMap = (window as IData).AMap;
        if (!AMap) {
          return;
        }
        if (!marker) {
          return;
        }
        const geocoder = new AMap.Geocoder({});
        const currentMarker = marker;
        geocoder.getAddress([lng, lat], (status: string, result: IData) => {
          if (!marker || marker !== currentMarker) {
            return;
          }
          if (
            status === 'complete' &&
            result.info === 'OK' &&
            result.regeocode
          ) {
            const regeocode = result.regeocode;
            const address = regeocode.formattedAddress;
            const markerContent = document.createElement('div');
            const markerImg = document.createElement('img');
            markerImg.style.width = '25px';
            markerImg.src =
              '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png';
            markerContent.appendChild(markerImg);
            const markerText = document.createElement('span');
            markerText.className = ns.b('popup-map-marker-text');
            markerText.textContent = address;
            markerContent.appendChild(markerText);
            marker.setContent(markerContent);
            marker.setMap(map);
            addressInfo.address = address;
            addressInfo.longitude = lng;
            addressInfo.latitude = lat;
            searchValue.value = address;
          }
        });
      };

      // 加载地图
      const loadMap = async () => {
        try {
          isLoading.value = true;
          (window as IData)._AMapSecurityConfig = {
            securityJsCode: ibiz.env.aMapSecurityJsCode,
          };
          await AMapLoader.load({
            key: ibiz.env.aMapKey!,
            version: '2.0',
            plugins: ['AMap.PlaceSearch', 'AMap.Geocoder'],
            AMapUI: {
              version: '1.1',
              plugins: ['misc/PoiPicker'],
            },
          });
        } finally {
          isLoading.value = false;
        }
      };

      // 初始化地图
      const initMap = () => {
        const AMap = (window as IData).AMap;
        if (!AMap) {
          return;
        }
        if (!mapContainerRef.value) {
          return;
        }
        map = new AMap.Map(mapContainerRef.value, {
          viewMode: '3D',
          zoom: 11,
        });
        map?.on('click', (e: IData) => {
          const lnglat = e.lnglat;
          const lng = lnglat.lng;
          const lat = lnglat.lat;
          if (lng != null && lat != null) {
            addMarker(lng, lat);
            getAddress(lng, lat);
          }
        });
        const AMapUI = (window as IData).AMapUI;
        if (!AMapUI) {
          return;
        }
        if (!searchInputRef.value || !searchResultContainerRef.value) {
          return;
        }
        AMapUI.loadUI(['misc/PoiPicker'], function (PoiPicker: any) {
          if (
            !searchInputRef.value ||
            !searchResultContainerRef.value ||
            !PoiPicker
          ) {
            return;
          }
          poiPicker = new PoiPicker({
            input: searchInputRef.value,
            placeSearchOptions: {
              map,
            },
            searchResultsContainer: searchResultContainerRef.value,
          });
          poiPicker?.on('poiPicked', function (poiResult: IData) {
            clearMarker();
            const item = poiResult.item;
            if (item) {
              addressInfo.address = item.name;
              addressInfo.longitude = item.location?.lng;
              addressInfo.latitude = item.location?.lat;
              searchValue.value = item.name;
              if (poiResult.source !== 'search') {
                poiPicker?.searchByKeyword(item.name);
              }
            }
          });
        });
      };

      // 处理对话框显示
      const handleShow = () => {
        dialogVisible.value = true;
        inputRef.value?.blur();
        nextTick(async () => {
          if (!(window as IData).AMap) {
            await loadMap();
          }
          if (!map || !mapContainerRef.value?.children.length) {
            map?.destroy();
            initMap();
          }
          searchValue.value = props.value || '';
          if (props.data && longitudeName && latitudeName) {
            const longitude = props.data[longitudeName];
            const latitude = props.data[latitudeName];
            if (longitude && latitude) {
              map?.setCenter([longitude, latitude], true);
              addMarker(longitude, latitude);
              getAddress(longitude, latitude);
            }
          }
        });
      };

      // 处理确认按钮点击
      const handleConfirm = () => {
        dialogVisible.value = false;
        if (longitudeName) {
          emit(
            'change',
            addressInfo.longitude != null ? addressInfo.longitude : null,
            longitudeName,
          );
        }
        if (latitudeName) {
          emit(
            'change',
            addressInfo.latitude != null ? addressInfo.latitude : null,
            latitudeName,
          );
        }
        emit('change', addressInfo.address || '');
        // eslint-disable-next-line no-use-before-define
        handleClose();
      };

      // 处理对话框关闭
      const handleClose = () => {
        dialogVisible.value = false;
        if (poiPicker) {
          poiPicker.clearSuggest();
          poiPicker.clearSearchResults();
        }
        searchValue.value = '';
        addressInfo.address = '';
        addressInfo.longitude = null;
        addressInfo.latitude = null;
        clearMarker();
      };

      // 处理输入框清空按钮点击
      const handleClear = (_e: MouseEvent) => {
        _e.stopPropagation();
        if (longitudeName) {
          emit('change', null, longitudeName);
        }
        if (latitudeName) {
          emit('change', null, latitudeName);
        }

        emit('change', '');
        handleClose();
      };

      // 处理搜索输入框清空按钮点击
      const handleSearchClear = () => {
        searchValue.value = '';
        addressInfo.address = '';
        addressInfo.longitude = null;
        addressInfo.latitude = null;
        clearMarker();
      };

      onUnmounted(() => {
        map?.destroy();
      });

      return {
        ns,
        c,
        inputRef,
        searchRef,
        mapContainerRef,
        searchResultContainerRef,
        dialogVisible,
        isLoading,
        searchValue,
        handleShow,
        handleConfirm,
        handleClose,
        handleClear,
        handleSearchClear,
      };
    },
    render() {
      let content;
      if (this.readonly) {
        content = this.value;
      } else {
        content = [
          <van-field
            class={this.ns.b('input')}
            ref='inputRef'
            modelValue={this.value}
            readonly
            placeholder={this.c.placeHolder}
            disabled={this.disabled}
            onClick={this.handleShow}
          >
            {{
              button: () => {
                if (this.readonly || !this.value) return;
                return <van-button icon='clear' onClick={this.handleClear} />;
              },
              'right-icon': () => {
                if (this.readonly) return;
                return <IBizCommonRightIcon />;
              },
            }}
          </van-field>,
          <van-popup
            class={this.ns.b('popup')}
            v-model:show={this.dialogVisible}
            round
            position='bottom'
            teleport='body'
            close-on-popstate={true}
          >
            {{
              default: () => {
                return (
                  <div class={this.ns.b('popup-wrapper')}>
                    <div class={this.ns.b('popup-wrapper-content')}>
                      <div class={this.ns.b('popup-content-search')}>
                        <van-search
                          ref='searchRef'
                          v-model={this.searchValue}
                          placeholder={ibiz.i18n.t(
                            'editor.mapPicker.searchPlaceholder',
                          )}
                          disabled={this.isLoading}
                        />
                      </div>
                      <div
                        class={this.ns.b('popup-map-content')}
                        v-loading={this.isLoading}
                      >
                        <div
                          class={this.ns.b('popup-map-container')}
                          ref='mapContainerRef'
                        ></div>
                        <div
                          class={this.ns.b('popup-search-result-container')}
                          ref='searchResultContainerRef'
                        ></div>
                      </div>
                    </div>
                    <div class={this.ns.b('popup-wrapper-footer')}>
                      <van-button
                        class={this.ns.b('popup-confirm')}
                        onClick={this.handleClose}
                      >
                        {ibiz.i18n.t('editor.common.cancel')}
                      </van-button>
                      <van-button
                        class={this.ns.b('popup-footer-button')}
                        type='primary'
                        disabled={this.isLoading}
                        onClick={this.handleConfirm}
                      >
                        {ibiz.i18n.t('editor.common.confirm')}
                      </van-button>
                    </div>
                  </div>
                );
              },
            }}
          </van-popup>,
        ];
      }

      return (
        <div
          class={[
            this.ns.b(),
            this.disabled ? this.ns.m('disabled') : '',
            this.readonly ? this.ns.m('readonly') : '',
          ]}
        >
          {content}
        </div>
      );
    },
  });
