import type { Component } from 'vue';

import CascaderField from './cascader/index.vue';
import CheckboxField from './checkbox/index.vue';
import DatePickerField from './date-picker/index.vue';
import NumberField from './number/index.vue';
import RadioField from './radio/index.vue';
import RangePickerField from './range-picker/index.vue';
import SelectField from './select/index.vue';
import SwitchField from './switch/index.vue';
import TextField from './text/index.vue';
import TextareaField from './textarea/index.vue';
import TimePickerField from './time-picker/index.vue';
import TreeSelectField from './tree-select/index.vue';

import type { BuiltinComponentName } from '../types';

export const BUILTIN_FIELD_MAP: Record<BuiltinComponentName, Component> = {
  text: TextField,
  textarea: TextareaField,
  number: NumberField,
  select: SelectField,
  radio: RadioField,
  checkbox: CheckboxField,
  switch: SwitchField,
  datePicker: DatePickerField,
  rangePicker: RangePickerField,
  timePicker: TimePickerField,
  cascader: CascaderField,
  treeSelect: TreeSelectField,
};

export {
  CascaderField,
  CheckboxField,
  DatePickerField,
  NumberField,
  RadioField,
  RangePickerField,
  SelectField,
  SwitchField,
  TextareaField,
  TextField,
  TimePickerField,
  TreeSelectField,
};
