import { shallowRef } from 'vue';
import { mergeWith } from 'lodash-es';

import { cloneDeep, get, has, isEqual, normalizePath, set, unset } from '../utils';

import type { Ref } from 'vue';
import type { DeepPartial, FormData, FormPath } from '../types';

export interface DynamicFormStore<T extends FormData = FormData> {
  formData: Ref<T>;
  getValue: (fieldName: FormPath) => unknown;
  setValue: (fieldName: FormPath, value: unknown) => boolean;
  setValues: (values: DeepPartial<T>) => boolean;
  resetFields: (fieldNames?: FormPath[]) => boolean;
}

const replaceObjectContents = <T extends FormData>(target: T, source: T) => {
  if (isEqual(target, source)) return false;

  const targetRecord = target as Record<string, unknown>;
  const sourceRecord = source as Record<string, unknown>;

  Object.keys(targetRecord).forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(sourceRecord, key)) delete targetRecord[key];
  });
  Object.entries(sourceRecord).forEach(([key, value]) => {
    if (!isEqual(targetRecord[key], value)) targetRecord[key] = cloneDeep(value);
  });

  return true;
};

export const createDynamicFormStore = <T extends FormData>(
  formData: Ref<T>,
  initialValues: T,
): DynamicFormStore<T> => {
  const initialData = shallowRef<T>(cloneDeep(initialValues));

  const getValue = (fieldName: FormPath) => get(formData.value, normalizePath(fieldName));

  const setValue = (fieldName: FormPath, value: unknown) => {
    const path = normalizePath(fieldName);
    if (isEqual(get(formData.value, path), value)) return false;
    set(formData.value, path, cloneDeep(value));
    return true;
  };

  const setValues = (values: DeepPartial<T>) => {
    const patch = cloneDeep(values);
    const changed = !isEqual(
      mergeWith(cloneDeep(formData.value), patch, (_target, source) =>
        Array.isArray(source) ? source : undefined,
      ),
      formData.value,
    );
    if (!changed) return false;

    mergeWith(formData.value, patch, (_target, source) =>
      Array.isArray(source) ? source : undefined,
    );
    return true;
  };

  const resetFields = (fieldNames?: FormPath[]) => {
    if (!fieldNames?.length) {
      return replaceObjectContents(formData.value, initialData.value);
    }

    let changed = false;
    fieldNames.forEach((fieldName) => {
      const path = normalizePath(fieldName);
      if (has(initialData.value, path)) {
        const initialValue = get(initialData.value, path);
        if (!isEqual(get(formData.value, path), initialValue)) {
          set(formData.value, path, cloneDeep(initialValue));
          changed = true;
        }
      } else if (has(formData.value, path)) {
        unset(formData.value, path);
        changed = true;
      }
    });
    return changed;
  };

  return {
    formData,
    getValue,
    setValue,
    setValues,
    resetFields,
  };
};
