import CheckboxField from '../components/fields/checkbox.vue';
import CheckboxGroupField from '../components/fields/checkbox-group.vue';
import DatePickerField from '../components/fields/date-picker.vue';
import NumberField from '../components/fields/number.vue';
import RadioField from '../components/fields/radio.vue';
import RangePickerField from '../components/fields/range-picker.vue';
import SelectField from '../components/fields/select.vue';
import SwitchField from '../components/fields/switch.vue';
import TextField from '../components/fields/text.vue';
import TextareaField from '../components/fields/textarea.vue';

import type { Component } from 'vue';
import type { BuiltinComponentName, ComponentModelConfig } from '../types';

/** Schema 内置名称到独立字段 SFC 的映射表。 */
export const builtinComponents: Partial<Record<BuiltinComponentName, Component>> = {
  text: TextField,
  textarea: TextareaField,
  number: NumberField,
  select: SelectField,
  radio: RadioField,
  checkbox: CheckboxField,
  checkboxGroup: CheckboxGroupField,
  switch: SwitchField,
  datePicker: DatePickerField,
  rangePicker: RangePickerField,
};

export const resolveBuiltinComponent = (component: BuiltinComponentName | Component) =>
  typeof component === 'string' ? builtinComponents[component] : component;

/**
 * 解析组件的受控属性和更新事件。
 * Checkbox、Switch 遵循 antdv-next 的 checked 模型，其余字段默认使用 value。
 */
export const resolveComponentModel = (
  component: BuiltinComponentName | Component,
  custom?: ComponentModelConfig,
): ComponentModelConfig => {
  if (custom) return custom;
  if (component === 'checkbox' || component === 'switch') {
    return { prop: 'checked', event: 'update:checked' };
  }
  return { prop: 'value', event: 'update:value' };
};
