import type { DynamicFormApi, FormData } from '../../dynamic-form';
import type { DynamicSearchInstance } from '../types';

interface CreateSearchApiOptions<T extends FormData, TOptions> {
  formApi: DynamicFormApi<T> | (() => DynamicFormApi<T>);
  getExpanded(): boolean;
  setOptions(options: TOptions): void;
  toggleExpand(force?: boolean): void;
}

type SearchApiProxy<T extends FormData, TOptions> = Omit<DynamicSearchInstance<T>, 'setOptions'> & {
  setOptions(options: TOptions): void;
};

/** DynamicSearch 组件 ref 与 useDynamicSearch 共享同一套表单 API 代理。 */
export function createSearchApiProxy<T extends FormData, TOptions>(
  options: CreateSearchApiOptions<T, TOptions>,
): SearchApiProxy<T, TOptions> {
  const { formApi, getExpanded, setOptions, toggleExpand } = options;
  const resolveFormApi = () => (typeof formApi === 'function' ? formApi() : formApi);

  return {
    get states() {
      return resolveFormApi().states;
    },
    get expanded() {
      return getExpanded();
    },
    getStates: () => resolveFormApi().getStates(),
    setStates: (states) => resolveFormApi().setStates(states),
    getState: (fieldName) => resolveFormApi().getState(fieldName),
    setState: (fieldName, state) => resolveFormApi().setState(fieldName, state),
    resetFields: (fieldNames) => resolveFormApi().resetFields(fieldNames),
    validate: (fieldNames) => resolveFormApi().validate(fieldNames),
    submit: () => resolveFormApi().submit(),
    clearValidate: (fieldNames) => resolveFormApi().clearValidate(fieldNames),
    scrollToField: (fieldName) => resolveFormApi().scrollToField(fieldName),
    getSchema: () => resolveFormApi().getSchema(),
    setSchema: (schema) => resolveFormApi().setSchema(schema),
    updateSchema: (patches) => resolveFormApi().updateSchema(patches),
    getFormInstance: () => resolveFormApi().getFormInstance(),
    setOptions,
    toggleExpand,
  };
}
