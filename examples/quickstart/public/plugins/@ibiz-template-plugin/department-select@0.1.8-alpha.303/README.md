# 部门选择器

部门选择器通常用于为管理人员指定或更改其所属部门。在组织或企业的管理系统中，部门选择器允许管理员或授权用户从预定义的部门列表中选择一个部门，并将其分配给特定的管理人员。主要目的是确保系统中的管理人员被正确分类和组织，以便他们可以访问特定部门的相关信息、数据和功能。隶属于**编辑器插件（基于数据选择标准编辑器扩展）**。

![部门选择器](./public/assets/images/scene.png)

## 输入参数

| 属性名      | 描述                                                         | 类型      | 默认值                                                       |
| ----------- | ------------------------------------------------------------ | --------- | ------------------------------------------------------------ |
| url         | 部门列表的请求路径                                           | string    | —                                                            |
| requestMode | 部门列表的请求方式                                           | get\|post | get                                                          |
| filter      | url中\${orgid} 字符串替换为表单数据或上下文数据，表单数据优先 | string    | srforgid                                                     |
| multiple    | 是否多选                                                     | boolean   | false                                                        |
| fillMap     | 填充对象，指定如何将选择的部门数据填入表单，由选中部门数据属性名称为键，填充表单属性名称为值组成的对象 | object    | {id: 表单值项名称，name: 表单项名称}                         |
| inputMap    | 输入对象，指定请求响应数据如何处理成UI所需的数据结构，UI所需属性名称（id、label、children、disabled）为键，映射响应数据属性名称为值，而responseField主要为解决响应数据结构差异 | object    | { id: 'id',label: 'label', children:'children',disabled: 'disabled', responseField: ''} |

## 扩展插件

| 名称                                           | 标识                 | 说明                                                         | 参数 |
| ---------------------------------------------- | -------------------- | ------------------------------------------------------------ | ---- |
| 【单选】部门（指定单位及其下级单位的所有部门） | ALLDEPATMENTSELECT   | filter=单位id对应的表单项名称，不设置时filter默认取当前登录人的所在单位srforgid<br />url=/sysorganizations/${orgid}/suborg/sysdepartments/picker<br/>filter=srforgid |      |
| 【多选】部门（指定单位及其下级单位的所有部门） | ALLDEPATMENTMULTIPLE | filter=单位id对应的表单项名称，不设置时filter默认取当前登录人的所在单位srforgid<br />url=/sysorganizations/${orgid}/suborg/sysdepartments/picker<br/>filter=srforgid |      |
| 【单选】部门（指定单位内的部门）               | DEPATMENTSELECT      | filter=单位id对应的表单项名称，不设置时filter默认取当前登录人的所在单位srforgid<br />url=/sysorganizations/${orgid}/sysdepartments/picker<br/>filter=srforgid |      |
| 【多选】部门（指定单位内的部门）               | DEPATMENTMULTIPLE    | filter=单位id对应的表单项名称，不设置时filter默认取当前登录人的所在单位srforgid<br />url=/sysorganizations/${orgid}/sysdepartments/picker<br/>filter=srforgid<br/>multiple=true |      |

## 基本使用

在具体项目中，先通过模型导入编辑器插件、再导入编辑器样式，最后在具体的表单中选择对应的编辑器样式即可复用，其中编辑器插件和编辑器样式具体数据参见附录。

## 附录：

### 编辑器插件

```json
[
  {
    "plugintype": "EDITOR_CUSTOMSTYLE",
    "rtobjectrepo": "@ibiz-template-plugin/department-select@0.1.4-alpha.1",
    "codename": "UsrPFPlugin1211952622",
    "plugintag": "DEPATMENTSELECT",
    "rtobjectmode": 2,
    "rtobjectname": "IBizDepartMent",
    "pssyspfpluginname": "部门选择"
  }
]
```

### 编辑器样式

```
[
  {
    "codename": "ALLDEPATMENTMULTIPLE",
    "pssyspfpluginid": "UsrPFPlugin1211952622",
    "memo": "filter=单位id对应的表单项名称，不设置时filter默认取当前登录人的所在单位srforgid\nurl=SYS_organizations/${orgid}/suborg/SYS_departments/picker",
    "repdefault": 0,
    "validflag": 1,
    "pssyseditorstylename": "【多选】部门（指定单位及其下级单位的所有部门）",
    "ctrlparams": "url=/sysorganizations/${orgid}/suborg/sysdepartments/picker\nfilter=srforgid\nmultiple=true",
    "pseditortypeid": "PICKER"
  },
  {
    "codename": "DEPATMENTSELECT",
    "pssyspfpluginid": "UsrPFPlugin1211952622",
    "memo": "filter=单位id对应的表单项名称，不设置时filter默认取当前登录人的所在单位srforgid\nurl=/SYS_organizations/${orgid}/SYS_departments/picker",
    "repdefault": 0,
    "validflag": 1,
    "pssyseditorstylename": "【单选】部门（指定单位内的部门）",
    "ctrlparams": "url=/sysorganizations/${orgid}/sysdepartments/picker\nfilter=srforgid",
    "pseditortypeid": "PICKER"
  },
  {
    "codename": "DEPATMENTMULTIPLE",
    "pssyspfpluginid": "UsrPFPlugin1211952622",
    "memo": "filter=单位id对应的表单项名称，不设置时filter默认取当前登录人的所在单位srforgid\nurl=SYS_organizations/${orgid}/SYS_departments/picker",
    "repdefault": 0,
    "validflag": 1,
    "pssyseditorstylename": "【多选】部门（指定单位内的部门）",
    "ctrlparams": "url=/sysorganizations/${orgid}/sysdepartments/picker\nfilter=srforgid\nmultiple=true",
    "pseditortypeid": "PICKER"
  },
  {
    "codename": "ALLDEPATMENTSELECT",
    "pssyspfpluginid": "UsrPFPlugin1211952622",
    "memo": "filter=单位id对应的表单项名称，不设置时filter默认取当前登录人的所在单位srforgid\nurl=SYS_organizations/${orgid}/suborg/SYS_departments/picker",
    "repdefault": 0,
    "validflag": 1,
    "pssyseditorstylename": "【单选】部门（指定单位及其下级单位的所有部门）",
    "ctrlparams": "url=/sysorganizations/${orgid}/suborg/sysdepartments/picker\nfilter=srforgid",
    "pseditortypeid": "PICKER"
  }
]
```