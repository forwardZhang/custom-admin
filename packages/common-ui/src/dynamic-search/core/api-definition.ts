import { createFormApiDefinition } from '../../dynamic-form/core/api-definition';

import type { ApiProxyDefinition } from '../../internal/use-api-proxy';
import type { FormData } from '../../dynamic-form';
import type { DynamicSearchApi } from '../types';

/**
 * DynamicSearchApi 的成员清单：表单的那份原样复用，再补上展开相关成员。
 * 这样两套 API 在组件挂载前的行为完全一致。
 */
export function createSearchApiDefinition<T extends FormData>(): ApiProxyDefinition<
  DynamicSearchApi<T>
> {
  const form = createFormApiDefinition<T>();

  return {
    commands: form.commands,
    methods: [...(form.methods ?? []), 'toggleExpand'],
    properties: [...(form.properties ?? []), 'expanded'],
    fallbacks: { ...form.fallbacks, expanded: () => false },
  };
}
