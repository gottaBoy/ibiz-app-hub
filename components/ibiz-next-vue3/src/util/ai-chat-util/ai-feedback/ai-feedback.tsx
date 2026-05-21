import { reactive, PropType, defineComponent, onMounted } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import { IModal } from '@ibiz-template/runtime';
import './ai-feedback.scss';

interface FeedbackItem {
  title: string;
  value?: string;
  children: string[];
}

interface FeedbackState {
  description: string;
  feedbackItems: FeedbackItem[];
}

export const AIFeedback = defineComponent({
  name: 'IBizAIFeedback',
  props: {
    content: { type: String },
    modal: { type: Object as PropType<IModal>, required: true },
  },
  setup(props) {
    const ns = useNamespace('ai-feedback');

    const feedback = reactive<FeedbackState>({
      description: '',
      feedbackItems: [],
    });

    const FEEDBACK_CATEGORIES = [
      {
        title: ibiz.i18n.t('util.aiChartUtil.regardingIssue'),
        children: [
          ibiz.i18n.t('util.aiChartUtil.understandProblem'),
          ibiz.i18n.t('util.aiChartUtil.forgotContext'),
          ibiz.i18n.t('util.aiChartUtil.notFollowingRequire'),
        ],
      },
      {
        title: ibiz.i18n.t('util.aiChartUtil.regardingResponse'),
        children: [
          ibiz.i18n.t('util.aiChartUtil.incorrectAswer'),
          ibiz.i18n.t('util.aiChartUtil.logicalConfusion'),
          ibiz.i18n.t('util.aiChartUtil.poorTimeliness'),
          ibiz.i18n.t('util.aiChartUtil.poorReadability'),
          ibiz.i18n.t('util.aiChartUtil.incompleteAnswer'),
          ibiz.i18n.t('util.aiChartUtil.unprofessional'),
        ],
      },
      {
        title: ibiz.i18n.t('util.aiChartUtil.report'),
        children: [
          ibiz.i18n.t('util.aiChartUtil.pornographicVulgar'),
          ibiz.i18n.t('util.aiChartUtil.politicallySensitive'),
          ibiz.i18n.t('util.aiChartUtil.illegalCriminal'),
          ibiz.i18n.t('util.aiChartUtil.discriminationPrejudice'),
          ibiz.i18n.t('util.aiChartUtil.violationPrivacy'),
          ibiz.i18n.t('util.aiChartUtil.contentInfringement'),
        ],
      },
    ];

    /**
     * @description 初始化反馈
     */
    const onInitFeedback = (): void => {
      feedback.feedbackItems = FEEDBACK_CATEGORIES.map(category => ({
        title: category.title,
        value: undefined,
        children: [...category.children],
      }));
      if (props.content) {
        const contentArray = props.content
          .split(';')
          .filter(item => item.trim());
        if (contentArray.length > 0) {
          // 前 N 个是分类值（N 为分类数量）
          const feedbackValues = contentArray.slice(
            0,
            FEEDBACK_CATEGORIES.length,
          );
          // 设置分类值
          feedbackValues.forEach((value, index) => {
            feedback.feedbackItems[index].value = value;
          });
          // 剩余的是描述内容
          const descriptionParts = contentArray.slice(
            FEEDBACK_CATEGORIES.length,
          );
          // 设置描述
          feedback.description = descriptionParts.join(';');
        }
      }
    };

    /**
     * @description 取消
     */
    const onCancel = (): void => {
      props.modal.dismiss();
    };

    /**
     * @description 确定
     */
    const onConfirm = (): void => {
      const contentArray = feedback.feedbackItems
        .map(item => item.value || '')
        .filter(item => !!item);
      contentArray.push(feedback.description);
      props.modal.dismiss({
        ok: true,
        data: [{ feedbackContent: contentArray.join(';') }],
      });
    };

    onMounted(() => {
      onInitFeedback();
    });

    return {
      ns,
      feedback,
      onCancel,
      onConfirm,
    };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('header')}>
          {ibiz.i18n.t('util.aiChartUtil.feedback')}
        </div>
        <div class={this.ns.e('content')}>
          {this.feedback.feedbackItems.map(item => {
            return (
              <div class={this.ns.e('group')}>
                <div class={this.ns.em('group', 'title')}>{item.title}</div>
                <el-radio-group
                  v-model={item.value}
                  class={this.ns.em('group', 'content')}
                >
                  {item.children.map((child, index) => {
                    return (
                      <el-radio key={index} label={child}>
                        {child}
                      </el-radio>
                    );
                  })}
                </el-radio-group>
              </div>
            );
          })}
          <div class={this.ns.e('description')}>
            <div class={this.ns.em('description', 'title')}>
              {ibiz.i18n.t('util.aiChartUtil.description')}
            </div>
            <el-input
              rows={3}
              type='textarea'
              v-model={this.feedback.description}
              placeholder={ibiz.i18n.t('util.aiChartUtil.placeholder')}
            />
          </div>
        </div>
        <div class={this.ns.e('footer')}>
          <el-button onClick={this.onCancel}>
            {ibiz.i18n.t('app.cancel')}
          </el-button>
          <el-button type='primary' onClick={this.onConfirm}>
            {ibiz.i18n.t('app.confirm')}
          </el-button>
        </div>
      </div>
    );
  },
});
