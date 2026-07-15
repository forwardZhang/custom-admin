<template>
  <!-- dependencies.if=false 时不创建节点；show=false 时保留节点和值，仅做视觉隐藏。 -->
  <Col
    v-if="dependencyState.shouldRender"
    :span="fieldSpan"
    :class="schema.class"
    :style="dependencyState.shouldShow ? undefined : { display: 'none' }"
  >
    <FormItem v-bind="formItemBindings">
      <template v-if="labelContent !== undefined" #label>
        <VNodeRenderer :content="labelContent" />
      </template>

      <template v-if="extraContent.length" #extra>
        <div class="cu-dynamic-form__extra">
          <VNodeRenderer v-for="(content, index) in extraContent" :key="index" :content="content" />
        </div>
      </template>

      <!-- 字段内容的优先级：全局只读 > 同名字段插槽 > Schema 组件 > 缺失提示。 -->
      <span v-if="context.readOnly.value" class="cu-dynamic-form__readonly">
        {{ readonlyText }}
      </span>

      <VNodeRenderer v-else-if="fieldSlot" :content="fieldSlot(slotContext)" />

      <component
        :is="resolvedComponent"
        v-else-if="resolvedComponent"
        v-bind="componentBindings"
        v-on="componentListeners"
      >
        <template
          v-for="(_, componentSlotName) in componentSlots"
          :key="componentSlotName"
          #[componentSlotName]
        >
          <VNodeRenderer :content="componentSlots[componentSlotName]?.()" />
        </template>
      </component>

      <div v-else class="cu-dynamic-form__component-error" role="alert">
        未找到组件 “{{ String(schema.component) }}”（字段：{{ slotName }}）
      </div>
    </FormItem>
  </Col>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { Col, FormItem } from 'antdv-next';

import { useDependencies } from '../composables/use-dependencies';
import { dynamicFormContextKey } from '../core/context';
import { resolveBuiltinComponent, resolveComponentModel } from '../core/builtin-components';
import { get, pathToString, resolvePath } from '../utils';
import VNodeRenderer from './vnode-renderer';

import type { Rule } from 'antdv-next';
import type { DynamicFormContext } from '../core/context';
import type { DynamicFormFieldRenderContext, DynamicFormFieldSchema, FormData } from '../types';

defineOptions({ name: 'DynamicFormFieldRenderer' });

const props = withDefaults(
  defineProps<{
    schema: DynamicFormFieldSchema<FormData>;
    basePath?: Array<string | number>;
    inheritedDisabled?: boolean;
  }>(),
  {
    basePath: () => [],
    inheritedDisabled: false,
  },
);

const context = inject(dynamicFormContextKey) as DynamicFormContext<FormData>;
if (!context) throw new Error('[DynamicForm] FieldRenderer must be used inside DynamicForm');

const fullPath = computed(() => resolvePath(props.basePath, props.schema.fieldName));
// 完整路径同时作为表单 name 和字段插槽名，例如 users[0].name。
const slotName = computed(() => pathToString(fullPath.value));
const value = computed(() => get(context.formData.value, fullPath.value));

const dependencyState = useDependencies(
  () => props.schema.dependencies,
  () => props.basePath,
  context,
);

const effectiveDisabled = computed(
  // 任意上游禁用来源生效后，子字段都不可交互。
  () => context.disabled.value || props.inheritedDisabled || dependencyState.disabled,
);
const effectiveRequired = computed(
  () => dependencyState.required ?? props.schema.required ?? false,
);

const fieldSpan = computed(() => {
  if (props.schema.span) return Math.min(24, Math.max(1, props.schema.span));
  return Math.max(1, Math.floor(24 / Math.max(1, context.column.value)));
});

const labelContent = computed(() =>
  typeof props.schema.label === 'function' ? props.schema.label() : props.schema.label,
);

const resolveContent = (content: DynamicFormFieldSchema['help']) =>
  typeof content === 'function' ? content() : content;

const extraContent = computed(() =>
  [resolveContent(props.schema.description), resolveContent(props.schema.help)].filter(
    (item) => item !== undefined && item !== null && item !== '',
  ),
);

const effectiveRules = computed<Rule[]>(() => {
  const rules: Rule[] = [];
  if (effectiveRequired.value) {
    rules.push({
      required: true,
      message:
        props.schema.requiredMessage ??
        (typeof props.schema.label === 'string' ? `请填写${props.schema.label}` : '该字段为必填项'),
    });
  }
  rules.push(...(props.schema.rules ?? []), ...dependencyState.rules);
  return rules;
});

const formItemBindings = computed(() => {
  const labelWidth = context.labelWidth.value;
  const layout = labelWidth
    ? {
        labelCol: { flex: typeof labelWidth === 'number' ? `${labelWidth}px` : labelWidth },
        wrapperCol: { flex: 1 },
      }
    : {};

  return {
    ...props.schema.formItemProps,
    ...layout,
    name: fullPath.value,
    rules: effectiveRules.value,
    validateTrigger: context.validateTrigger.value,
  };
});

const resolvedComponent = computed(() => resolveBuiltinComponent(props.schema.component));
// 自定义组件可通过 componentModel 改写受控 prop / event，默认遵循 antdv-next 约定。
const componentModel = computed(() =>
  resolveComponentModel(props.schema.component, props.schema.componentModel),
);

const updateValue = (nextValue: unknown) => context.updateValue(fullPath.value, nextValue);

const slotContext = computed<DynamicFormFieldRenderContext<FormData>>(() => ({
  value: value.value,
  values: context.formData.value,
  fieldName: fullPath.value,
  schema: props.schema,
  disabled: effectiveDisabled.value,
  readOnly: context.readOnly.value,
  formApi: context.formApi,
  updateValue,
}));

const fieldSlot = computed(() => context.slots[slotName.value]);
// renderComponentContent 用于向实际字段组件透传具名插槽，不替换字段组件本身。
const componentSlots = computed(
  () => props.schema.renderComponentContent?.(slotContext.value) ?? {},
);

const componentBindings = computed(() => ({
  ...props.schema.componentProps,
  ...dependencyState.componentProps,
  disabled: effectiveDisabled.value,
  [componentModel.value.prop]: value.value,
}));

const componentListeners = computed(() => ({
  [componentModel.value.event]: updateValue,
}));

const readonlyText = computed(() => {
  if (value.value === undefined || value.value === null || value.value === '') return '-';
  if (typeof value.value === 'object') return JSON.stringify(value.value);
  return String(value.value);
});
</script>
