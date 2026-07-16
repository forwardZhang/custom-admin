<template>
  <!-- 容器参与依赖控制和栅格布局，但自身不注册 FormItem。 -->
  <Col v-if="schemaState.shouldRender" :span="fieldSpan" :class="schema.class">
    <!-- component=card 使用标题卡片；component=collapse 使用单面板折叠容器。 -->
    <Card v-if="schema.component === 'card'" v-bind="containerProps">
      <template v-if="labelContent !== undefined" #title>
        <VNodeRenderer :content="labelContent" />
      </template>
      <Row :gutter="[16, 16]">
        <slot :base-path="basePath" :inherited-disabled="effectiveDisabled" />
      </Row>
    </Card>

    <Collapse v-else v-bind="containerProps">
      <CollapsePanel key="content">
        <template v-if="labelContent !== undefined" #header>
          <VNodeRenderer :content="labelContent" />
        </template>
        <Row :gutter="[16, 16]">
          <slot :base-path="basePath" :inherited-disabled="effectiveDisabled" />
        </Row>
      </CollapsePanel>
    </Collapse>
  </Col>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { Card, Col, Collapse, CollapsePanel, Row } from 'antdv-next';

import { useSchemaState } from '../composables/use-schema-state';
import { dynamicFormContextKey } from '../core/context';
import { createResolveContext } from '../utils';
import VNodeRenderer from '../renderers/vnode-renderer';

import type { DynamicFormContext } from '../core/context';
import type { DynamicFormContainerSchema, FormData } from '../types';

defineOptions({ name: 'DynamicFormContainer' });

const props = withDefaults(
  defineProps<{
    schema: DynamicFormContainerSchema<FormData>;
    basePath?: Array<string | number>;
    inheritedDisabled?: boolean;
  }>(),
  {
    basePath: () => [],
    inheritedDisabled: false,
  },
);

defineSlots<{
  default: (props: { basePath: Array<string | number>; inheritedDisabled: boolean }) => unknown;
}>();

const context = inject(dynamicFormContextKey) as DynamicFormContext<FormData>;
if (!context) throw new Error('[DynamicForm] Container must be used inside DynamicForm');

const resolveContext = computed(() =>
  createResolveContext(context.formData.value, context.formApi, props.basePath, props.basePath),
);
const schemaState = useSchemaState(
  () => props.schema,
  () => resolveContext.value,
);

const effectiveDisabled = computed(
  () => context.disabled.value || props.inheritedDisabled || schemaState.disabled,
);
const fieldSpan = computed(() => props.schema.span ?? 24);
const labelContent = computed(() =>
  typeof props.schema.label === 'function'
    ? props.schema.label(resolveContext.value)
    : props.schema.label,
);
const containerProps = computed(() => ({
  ...(props.schema.component === 'collapse' ? { defaultActiveKey: ['content'] } : {}),
  ...schemaState.componentProps,
}));
</script>
