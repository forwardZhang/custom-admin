<template>
  <!-- ArrayField 自身注册数组路径，children 则由 SchemaRenderer 按数组索引递归渲染。 -->
  <Col
    v-if="dependencyState.shouldRender"
    :span="fieldSpan"
    :class="schema.class"
    :style="dependencyState.shouldShow ? undefined : { display: 'none' }"
  >
    <FormItem
      :name="fullPath"
      :rules="effectiveRules"
      :validate-trigger="context.validateTrigger.value"
    >
      <template v-if="labelContent !== undefined" #label>
        <VNodeRenderer :content="labelContent" />
      </template>

      <div class="cu-dynamic-form-array">
        <!-- 每个数组元素对应一张 Card，操作按钮只在非只读模式显示。 -->
        <Card
          v-for="(item, index) in items"
          :key="itemKeys[index]"
          size="small"
          class="cu-dynamic-form-array__item"
        >
          <template #title>{{ getItemTitle(index) }}</template>
          <template v-if="!context.readOnly.value" #extra>
            <Space size="small" wrap>
              <Button
                size="small"
                type="link"
                :disabled="effectiveDisabled || index === 0"
                @click="moveItem(index, index - 1)"
              >
                {{ arrayProps.moveUpText ?? '上移' }}
              </Button>
              <Button
                size="small"
                type="link"
                :disabled="effectiveDisabled || index === items.length - 1"
                @click="moveItem(index, index + 1)"
              >
                {{ arrayProps.moveDownText ?? '下移' }}
              </Button>
              <Button
                size="small"
                type="link"
                :disabled="effectiveDisabled || reachedMax"
                @click="copyItem(index)"
              >
                {{ arrayProps.copyText ?? '复制' }}
              </Button>
              <Button
                size="small"
                type="link"
                danger
                :disabled="effectiveDisabled || reachedMin"
                @click="removeItem(index)"
              >
                {{ arrayProps.removeText ?? '删除' }}
              </Button>
            </Space>
          </template>

          <Row :gutter="[16, 16]">
            <slot
              :schema="schema.children"
              :base-path="[...fullPath, index]"
              :inherited-disabled="effectiveDisabled"
            />
          </Row>
        </Card>

        <Button
          v-if="!context.readOnly.value"
          type="dashed"
          block
          :disabled="effectiveDisabled || reachedMax"
          @click="addItem"
        >
          {{ arrayProps.addText ?? '新增一项' }}
        </Button>
      </div>
    </FormItem>
  </Col>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue';
import { Button, Card, Col, FormItem, Row, Space } from 'antdv-next';

import { useDependencies } from '../composables/use-dependencies';
import { dynamicFormContextKey } from '../core/context';
import VNodeRenderer from '../renderers/vnode-renderer';
import { cloneDeep, createArrayItem, get, resolvePath } from '../utils';

import type { Rule } from 'antdv-next';
import type { DynamicFormContext } from '../core/context';
import type { DynamicFormArraySchema, FormData } from '../types';

defineOptions({ name: 'DynamicFormArrayField' });

const props = withDefaults(
  defineProps<{
    schema: DynamicFormArraySchema<FormData>;
    basePath?: Array<string | number>;
    inheritedDisabled?: boolean;
  }>(),
  {
    basePath: () => [],
    inheritedDisabled: false,
  },
);

defineSlots<{
  default: (props: {
    schema: DynamicFormArraySchema<FormData>['children'];
    basePath: Array<string | number>;
    inheritedDisabled: boolean;
  }) => unknown;
}>();

const context = inject(dynamicFormContextKey) as DynamicFormContext<FormData>;
if (!context) throw new Error('[DynamicForm] ArrayField must be used inside DynamicForm');

let keySeed = 0;
const createKey = () => `dynamic-form-array-${Date.now()}-${keySeed++}`;

const fullPath = computed(() => resolvePath(props.basePath, props.schema.fieldName));
// 非数组值统一视为空数组，使异常的外部 modelValue 不会打断渲染。
const items = computed<Record<string, unknown>[]>(() => {
  const value = get(context.formData.value, fullPath.value);
  return Array.isArray(value) ? value : [];
});
const itemKeys = ref<string[]>(items.value.map(createKey));

// 业务数组可能由外部整体替换；独立 key 只跟随长度，避免把业务字段当作渲染标识。
watch(
  () => items.value.length,
  (length) => {
    while (itemKeys.value.length < length) itemKeys.value.push(createKey());
    if (itemKeys.value.length > length) itemKeys.value.splice(length);
  },
);

const dependencyState = useDependencies(
  () => props.schema.dependencies,
  () => props.basePath,
  context,
);

const effectiveDisabled = computed(
  () => context.disabled.value || props.inheritedDisabled || dependencyState.disabled,
);
const effectiveRequired = computed(
  () => dependencyState.required ?? props.schema.required ?? false,
);
const fieldSpan = computed(() => props.schema.span ?? 24);
const arrayProps = computed(() => ({
  ...props.schema.componentProps,
  ...dependencyState.componentProps,
}));
const reachedMin = computed(() => items.value.length <= (props.schema.minItems ?? 0));
const reachedMax = computed(
  () => props.schema.maxItems !== undefined && items.value.length >= props.schema.maxItems,
);
const labelContent = computed(() =>
  typeof props.schema.label === 'function' ? props.schema.label() : props.schema.label,
);

const effectiveRules = computed<Rule[]>(() => {
  // 数组级规则与 children 字段规则独立：这里校验必填和条目数量。
  const rules: Rule[] = [];
  if (effectiveRequired.value) {
    rules.push({
      required: true,
      type: 'array',
      message:
        props.schema.requiredMessage ??
        (typeof props.schema.label === 'string' ? `请填写${props.schema.label}` : '该字段为必填项'),
    });
  }
  if (props.schema.minItems !== undefined || props.schema.maxItems !== undefined) {
    rules.push({
      validator: async (_rule, value) => {
        const list = Array.isArray(value) ? value : [];
        if (props.schema.minItems !== undefined && list.length < props.schema.minItems) {
          throw new Error(`至少需要 ${props.schema.minItems} 项`);
        }
        if (props.schema.maxItems !== undefined && list.length > props.schema.maxItems) {
          throw new Error(`最多允许 ${props.schema.maxItems} 项`);
        }
      },
    });
  }
  rules.push(...(props.schema.rules ?? []), ...dependencyState.rules);
  return rules;
});

const updateItems = (nextItems: Record<string, unknown>[]) => {
  context.updateValue(fullPath.value, nextItems);
};

const runHook = async (
  hook: DynamicFormArraySchema<FormData>['beforeAdd'],
  payload: { index?: number; item?: Record<string, unknown> },
) => {
  // 所有操作钩子返回 false 时取消本次变更，void 则视为放行。
  if (!hook) return true;
  return (
    (await hook({
      values: context.formData.value,
      fieldName: fullPath.value,
      formApi: context.formApi,
      ...payload,
    })) !== false
  );
};

const addItem = async () => {
  if (effectiveDisabled.value || reachedMax.value) return;
  const item = createArrayItem(props.schema.children);
  if (!(await runHook(props.schema.beforeAdd, { item }))) return;
  itemKeys.value.push(createKey());
  updateItems([...cloneDeep(items.value), item]);
};

const removeItem = async (index: number) => {
  if (effectiveDisabled.value || reachedMin.value) return;
  const item = cloneDeep(items.value[index]);
  if (!(await runHook(props.schema.beforeRemove, { index, item }))) return;
  const nextItems = cloneDeep(items.value);
  nextItems.splice(index, 1);
  itemKeys.value.splice(index, 1);
  updateItems(nextItems);
};

const copyItem = async (index: number) => {
  if (effectiveDisabled.value || reachedMax.value) return;
  const item = cloneDeep(items.value[index]);
  if (!(await runHook(props.schema.beforeCopy, { index, item }))) return;
  itemKeys.value.splice(index + 1, 0, createKey());
  const nextItems = cloneDeep(items.value);
  nextItems.splice(index + 1, 0, item ?? {});
  updateItems(nextItems);
};

const moveItem = async (from: number, to: number) => {
  if (effectiveDisabled.value || to < 0 || to >= items.value.length) return;
  if (props.schema.beforeMove) {
    const allowed = await props.schema.beforeMove({
      values: context.formData.value,
      fieldName: fullPath.value,
      formApi: context.formApi,
      from,
      to,
      index: from,
      item: cloneDeep(items.value[from]),
    });
    if (allowed === false) return;
  }

  const nextItems = cloneDeep(items.value);
  const [item] = nextItems.splice(from, 1);
  nextItems.splice(to, 0, item ?? {});
  const [key] = itemKeys.value.splice(from, 1);
  itemKeys.value.splice(to, 0, key ?? createKey());
  updateItems(nextItems);
};

const getItemTitle = (index: number) => {
  const title = arrayProps.value.itemTitle;
  if (typeof title === 'function') return title(index);
  return title ? `${title} ${index + 1}` : `第 ${index + 1} 项`;
};
</script>

<style scoped>
.cu-dynamic-form-array {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cu-dynamic-form-array__item {
  width: 100%;
}
</style>
