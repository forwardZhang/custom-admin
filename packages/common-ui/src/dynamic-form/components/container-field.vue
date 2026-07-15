<template>
  <!-- 容器参与依赖控制和栅格布局，但自身不注册 FormItem。 -->
  <Col
    v-if="dependencyState.shouldRender"
    :span="fieldSpan"
    :class="schema.class"
    :style="dependencyState.shouldShow ? undefined : { display: 'none' }"
  >
    <!-- component=card 使用标题卡片；component=collapse 使用单面板折叠容器。 -->
    <Card v-if="schema.component === 'card'" v-bind="containerProps">
      <template v-if="labelContent !== undefined" #title>
        <VNodeRenderer :content="labelContent" />
      </template>
      <Row :gutter="[16, 16]">
        <slot :base-path="childBasePath" :inherited-disabled="effectiveDisabled" />
      </Row>
    </Card>

    <Collapse v-else v-bind="containerProps">
      <CollapsePanel key="content">
        <template v-if="labelContent !== undefined" #header>
          <VNodeRenderer :content="labelContent" />
        </template>
        <Row :gutter="[16, 16]">
          <slot :base-path="childBasePath" :inherited-disabled="effectiveDisabled" />
        </Row>
      </CollapsePanel>
    </Collapse>
  </Col>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { Card, Col, Collapse, CollapsePanel, Row } from 'antdv-next';

import { useDependencies } from '../composables/use-dependencies';
import { dynamicFormContextKey } from '../core/context';
import VNodeRenderer from '../renderers/vnode-renderer';
import { resolvePath } from '../utils';

import type { DynamicFormContext } from '../core/context';
import type { DynamicFormContainerSchema, FormData } from '../types';

defineOptions({ name: 'DynamicFormContainerField' });

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
if (!context) throw new Error('[DynamicForm] ContainerField must be used inside DynamicForm');

const dependencyState = useDependencies(
  () => props.schema.dependencies,
  () => props.basePath,
  context,
);

const childBasePath = computed(() => resolvePath(props.basePath, props.schema.fieldName));
// 容器可用 fieldName 建立数据命名空间；省略时仅承担视觉分组作用。
const effectiveDisabled = computed(
  () => context.disabled.value || props.inheritedDisabled || dependencyState.disabled,
);
const fieldSpan = computed(() => props.schema.span ?? 24);
const labelContent = computed(() =>
  typeof props.schema.label === 'function' ? props.schema.label() : props.schema.label,
);
const containerProps = computed(() => ({
  ...(props.schema.component === 'collapse' ? { defaultActiveKey: ['content'] } : {}),
  ...props.schema.componentProps,
  ...dependencyState.componentProps,
}));
</script>
