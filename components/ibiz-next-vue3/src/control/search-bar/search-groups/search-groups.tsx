import { defineComponent, computed, PropType, ref } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import {
  IBackendSearchBarGroup,
  SearchBarController,
} from '@ibiz-template/runtime';
import './search-groups.scss';
import { ElMessageBox } from 'element-plus';
import draggable from 'vuedraggable';
import { mergeInLeft, showTitle } from '@ibiz-template/core';
import { useNewGroup } from './new-group-util';
import { useEditGroup } from './edit-group-util';

export const SearchGroups = defineComponent({
  name: 'IBizSearchGroups',
  components: {
    draggable,
  },
  props: {
    controller: {
      type: Object as PropType<SearchBarController>,
      required: true,
    },
    counterData: {
      type: Object as PropType<IData>,
      default: () => {},
    },
  },
  setup(props) {
    const ns = useNamespace('search-groups');

    const c = props.controller;

    // 管理
    const manageDialogVisible = ref(false);

    // 新建相关
    const {
      newDialogVisible,
      newForm,
      newFormRef,
      newFormRules,
      handleNewFormSubmit,
      handleNewFormCancel,
    } = useNewGroup(c);

    // 编辑相关
    const {
      editDialogVisible,
      editForm,
      editFormRef,
      editFormRules,
      handleEditFormSubmit,
      handleEditFormCancel,
    } = useEditGroup(c);

    // 快速分组显示数量
    const count = c.model.quickGroupCount || 4;

    // 显示的分组项
    const showGroups = computed(() => {
      const visibleGroups = c.state.searchBarGroups.filter(item => item.show);
      return visibleGroups.slice(0, count);
    });

    // 隐藏的分组项
    const hiddenGroups = computed(() => {
      const visibleGroups = c.state.searchBarGroups.filter(item => item.show);
      return visibleGroups.slice(count);
    });

    // 是否激活更多
    const isActiveMore = computed(() => {
      if (c.state.selectedSearchGroupItem) {
        return hiddenGroups.value.includes(c.state.selectedSearchGroupItem);
      }
      return false;
    });

    // 编辑标题
    const editLinkTitle = (groupItem: IBackendSearchBarGroup) => {
      if (groupItem.saved) {
        if (groupItem.noEdit) {
          return ibiz.i18n.t('control.searchBar.searchGroups.noEditPrompt');
        }
        return '';
      }
      return ibiz.i18n.t('control.searchBar.searchGroups.savePrompt');
    };

    // 点击分组项
    const onGroupClick = (item: IBackendSearchBarGroup) => {
      c.handleGroupClick(item);
    };

    // 新建分组
    const newGroup = () => {
      newDialogVisible.value = true;
    };

    // 管理分组
    const manageGroup = () => {
      manageDialogVisible.value = true;
    };

    // 编辑分组
    const editGroup = (groupItem: IBackendSearchBarGroup) => {
      editDialogVisible.value = true;
      c.currentEditGroup = groupItem;
      editForm.caption = groupItem.caption || groupItem.name;
    };

    // 删除分组
    const removeGroup = (groupItem: IBackendSearchBarGroup) => {
      ElMessageBox({
        title: ibiz.i18n.t('control.searchBar.searchGroups.delTitle'),
        message: () => {
          return (
            <div class={ns.b('remove-dialog')}>
              <div
                class={ns.b('remove-dialog-content')}
                v-html={ibiz.i18n.t(
                  'control.searchBar.searchGroups.confirmDelPrompt',
                  { itemName: groupItem.caption || groupItem.name },
                )}
              ></div>
              <div class={ns.b('remove-dialog-tip')}>
                {ibiz.i18n.t(
                  'control.searchBar.searchGroups.unrecoverablePrompt',
                )}
              </div>
            </div>
          );
        },
        showCancelButton: true,
        confirmButtonText: ibiz.i18n.t('control.common.determine'),
        confirmButtonClass: ns.b('remove-confirm-btn'),
        cancelButtonText: ibiz.i18n.t('app.cancel'),
        cancelButtonClass: ns.b('remove-cancel-btn'),
      })
        .then(async () => {
          if (groupItem.id) {
            const res = await c.service.remove(groupItem.id);
            if (res.ok) {
              // UI删除这项
              const index = c.state.searchBarGroups.findIndex(
                item => item.name === groupItem.name,
              );
              if (index !== -1) {
                c.state.searchBarGroups.splice(index, 1);
              }
            }
            ibiz.message.success(
              `${ibiz.i18n.t('control.common.deleteSuccess')}！`,
            );
            await c.initSearBarGroups();
          }
        })
        .catch(() => {});
    };

    // 拖拽变化后
    const onDragChange = async (evt: IData) => {
      // 更新 order 值
      c.state.searchBarGroups.forEach((item, index) => {
        item.order = (index + 1) * 100;
      });

      if (evt.moved) {
        const newIndex = evt.moved.newIndex;
        const oldIndex = evt.moved.oldIndex;
        // 获取 order 变化的一段
        const startIndex = Math.min(newIndex, oldIndex);
        const endIndex = Math.max(newIndex, oldIndex) + 1;
        const changedSearchBarGroups = c.state.searchBarGroups.slice(
          startIndex,
          endIndex,
        );
        if (changedSearchBarGroups.length > 0) {
          const updateBatch = async () => {
            await c.service.updateBatch(changedSearchBarGroups);
          };
          // 找出未新建的走批新建
          const unSavedGroups = changedSearchBarGroups.filter(
            group => !group.saved,
          );
          if (unSavedGroups.length) {
            const res = await c.service.createBatch(unSavedGroups);
            if (res.ok && res.data && res.data[0]) {
              // 批新建完先合并数据
              const createBatchGroups = res.data[0];
              if (createBatchGroups.length > 0) {
                createBatchGroups.forEach((createGroup: IData) => {
                  const newCreateGroup = changedSearchBarGroups.find(
                    group => group.name === createGroup.name,
                  );
                  if (newCreateGroup) {
                    mergeInLeft(newCreateGroup, createGroup);
                  }
                });
              }
              // 合完数据再去更新
              await updateBatch();
              // 更新 saved
              unSavedGroups.forEach(group => {
                const unSavedGroup = c.state.searchBarGroups.find(
                  item => item.name === group.name,
                );
                if (unSavedGroup) {
                  unSavedGroup.saved = true;
                }
              });
            }
          } else {
            await updateBatch();
          }
        }
      }
    };

    return {
      ns,
      c,
      showGroups,
      hiddenGroups,
      onGroupClick,
      newDialogVisible,
      editDialogVisible,
      manageDialogVisible,
      newGroup,
      manageGroup,
      newForm,
      newFormRef,
      newFormRules,
      handleNewFormSubmit,
      handleNewFormCancel,
      editForm,
      editFormRef,
      editFormRules,
      handleEditFormSubmit,
      handleEditFormCancel,
      editGroup,
      removeGroup,
      isActiveMore,
      onDragChange,
      editLinkTitle,
    };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        {this.showGroups?.map(groupItem => {
          const visible = this.c.calcCountVisible(groupItem);
          if (!visible) {
            return null;
          }
          return (
            <span
              class={[
                this.ns.b('quick-group-item'),
                this.ns.is(
                  'selected',
                  this.c.state.selectedSearchGroupItem?.name === groupItem.name,
                ),
              ]}
              onClick={() => this.onGroupClick(groupItem)}
            >
              {groupItem.caption || groupItem.name}
              {groupItem.counterId && (
                <iBizBadge
                  class={this.ns.e('counter')}
                  value={this.counterData[groupItem.counterId]}
                  counterMode={groupItem.counterMode}
                />
              )}
            </span>
          );
        })}
        <el-dropdown popper-class={this.ns.b('dropdown')}>
          {{
            default: () => (
              <div
                class={[
                  this.ns.b('more'),
                  this.ns.is('selected', this.isActiveMore),
                ]}
              >
                {this.isActiveMore
                  ? this.c.state.selectedSearchGroupItem?.caption
                  : this.c.model.groupMoreText || ibiz.i18n.t('app.more')}
                <ion-icon name='chevron-down-outline'></ion-icon>
              </div>
            ),
            dropdown: () => (
              <el-dropdown-menu>
                {this.hiddenGroups.map(groupItem => {
                  return (
                    <el-dropdown-item
                      onClick={() => this.onGroupClick(groupItem)}
                    >
                      <ion-icon name='list-outline'></ion-icon>
                      <span class={this.ns.b('item-caption')}>
                        {groupItem.caption || groupItem.name}
                      </span>
                      {this.c.state.selectedSearchGroupItem?.name ===
                        groupItem.name && (
                        <ion-icon name='checkmark-outline'></ion-icon>
                      )}
                    </el-dropdown-item>
                  );
                })}
                <el-dropdown-item
                  divided={this.hiddenGroups.length > 0}
                  onClick={this.newGroup}
                >
                  <ion-icon name='add-outline'></ion-icon>
                  <span class={this.ns.b('item-caption')}>
                    {ibiz.i18n.t('control.searchBar.searchGroups.newGroup')}
                  </span>
                </el-dropdown-item>
                <el-dropdown-item onClick={this.manageGroup}>
                  <ion-icon name='settings-outline'></ion-icon>
                  <span class={this.ns.b('item-caption')}>
                    {ibiz.i18n.t('control.searchBar.searchGroups.groupManage')}
                  </span>
                </el-dropdown-item>
              </el-dropdown-menu>
            ),
          }}
        </el-dropdown>
        <el-dialog
          v-model={this.newDialogVisible}
          title={showTitle(
            ibiz.i18n.t('control.searchBar.searchGroups.newGroup'),
          )}
          modal-class={this.ns.b('new-dialog')}
        >
          {{
            default: () => {
              return (
                <el-form
                  ref='newFormRef'
                  model={this.newForm}
                  label-position='top'
                  rules={this.newFormRules}
                >
                  <el-form-item
                    label={ibiz.i18n.t(
                      'control.searchBar.searchGroups.groupName',
                    )}
                    prop='caption'
                  >
                    <el-input
                      v-model={this.newForm.caption}
                      placeholder={ibiz.i18n.t(
                        'control.searchBar.searchGroups.enterPrompt',
                      )}
                    />
                  </el-form-item>
                </el-form>
              );
            },
            footer: () => {
              return (
                <div class={this.ns.b('new-dialog-footer')}>
                  <el-button
                    class={this.ns.b('cancel-btn')}
                    onClick={this.handleNewFormCancel}
                  >
                    {ibiz.i18n.t('control.searchBar.searchGroups.dialogCancel')}
                  </el-button>
                  <el-button type='primary' onClick={this.handleNewFormSubmit}>
                    {ibiz.i18n.t(
                      'control.searchBar.searchGroups.dialogDetermine',
                    )}
                  </el-button>
                </div>
              );
            },
          }}
        </el-dialog>
        <el-dialog
          v-model={this.editDialogVisible}
          title={showTitle(
            ibiz.i18n.t('control.searchBar.searchGroups.editGroup'),
          )}
          modal-class={this.ns.b('edit-dialog')}
        >
          {{
            default: () => {
              return (
                <el-form
                  ref='editFormRef'
                  model={this.editForm}
                  label-position='top'
                  rules={this.editFormRules}
                >
                  <el-form-item
                    label={ibiz.i18n.t(
                      'control.searchBar.searchGroups.groupName',
                    )}
                    prop='caption'
                  >
                    <el-input
                      v-model={this.editForm.caption}
                      placeholder={ibiz.i18n.t(
                        'control.searchBar.searchGroups.enterPrompt',
                      )}
                    />
                  </el-form-item>
                </el-form>
              );
            },
            footer: () => {
              return (
                <div class={this.ns.b('edit-dialog-footer')}>
                  <el-button
                    class={this.ns.b('cancel-btn')}
                    onClick={this.handleEditFormCancel}
                  >
                    {ibiz.i18n.t('control.searchBar.searchGroups.dialogCancel')}
                  </el-button>
                  <el-button type='primary' onClick={this.handleEditFormSubmit}>
                    {ibiz.i18n.t(
                      'control.searchBar.searchGroups.dialogDetermine',
                    )}
                  </el-button>
                </div>
              );
            },
          }}
        </el-dialog>
        <el-dialog
          v-model={this.manageDialogVisible}
          title={showTitle(
            ibiz.i18n.t('control.searchBar.searchGroups.groupManage'),
          )}
          modal-class={this.ns.b('manage-dialog')}
        >
          <div class={this.ns.b('manage-dialog-content')}>
            <div class={this.ns.b('content-top')}>
              <div class={this.ns.b('content-top-left')}>
                <ion-icon name='alert-circle-outline'></ion-icon>
                {ibiz.i18n.t('control.searchBar.searchGroups.manageTips')}
              </div>
              <div class={this.ns.b('content-top-right')}>
                <el-button
                  onClick={() => {
                    this.newDialogVisible = true;
                  }}
                >
                  <ion-icon name='add-outline'></ion-icon>
                  {ibiz.i18n.t('control.searchBar.searchGroups.newGroup')}
                </el-button>
              </div>
            </div>
            <div class={this.ns.b('content-bottom')}>
              <div class={this.ns.b('table-header')}>
                <div class={this.ns.b('name')}>
                  {ibiz.i18n.t('control.searchBar.searchGroups.name')}
                </div>
                <div class={this.ns.b('show')}>
                  {ibiz.i18n.t('control.searchBar.searchGroups.show')}
                </div>
                <div class={this.ns.b('action')}>
                  {ibiz.i18n.t('control.searchBar.searchGroups.operate')}
                </div>
              </div>
              <draggable
                class={this.ns.b('table-body')}
                v-model={this.c.state.searchBarGroups}
                group={this.c.model.id}
                itemKey='id'
                sort={true}
                force-fallback={true}
                animation={500}
                ghost-class={this.ns.b('table-row-ghost')}
                onChange={(evt: IData) => this.onDragChange(evt)}
              >
                {{
                  item: ({
                    element: groupItem,
                  }: {
                    element: IBackendSearchBarGroup;
                  }) => {
                    return (
                      <div class={this.ns.b('table-row')}>
                        <div class={this.ns.b('name')}>
                          {groupItem.caption || groupItem.name}
                        </div>
                        <div class={this.ns.b('show')}>
                          <el-switch v-model={groupItem.show}></el-switch>
                        </div>
                        <div class={this.ns.b('action')}>
                          <el-link
                            type='primary'
                            disabled={!groupItem.saved || groupItem.noEdit}
                            title={showTitle(this.editLinkTitle(groupItem))}
                            onClick={() => this.editGroup(groupItem)}
                          >
                            {ibiz.i18n.t('app.edit')}
                          </el-link>
                          <el-link
                            type='danger'
                            disabled={
                              !groupItem.saved ||
                              groupItem.ownerType === 'SYSTEM'
                            }
                            title={showTitle(
                              !groupItem.saved ||
                                groupItem.ownerType === 'SYSTEM'
                                ? ibiz.i18n.t(
                                    'control.searchBar.searchGroups.savePrompt',
                                  )
                                : '',
                            )}
                            onClick={() => this.removeGroup(groupItem)}
                          >
                            {ibiz.i18n.t('app.delete')}
                          </el-link>
                        </div>
                      </div>
                    );
                  },
                }}
              </draggable>
            </div>
          </div>
        </el-dialog>
      </div>
    );
  },
});
