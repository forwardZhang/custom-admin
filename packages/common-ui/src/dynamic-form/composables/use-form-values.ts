import type { Ref } from 'vue';

import { cloneDeep, get, isEqual, set, unset } from 'lodash-es';
import { ref } from 'vue';

import { normalizePath, pathToString } from '../utils/path';
import { applySchemaDefaults } from '../utils/schema';
import { cloneValue, mergeValues, syncValues } from '../utils/value';

import type { DeepPartial, DynamicFormSchema, FormData, FormPath } from '../types';

export interface UseFormValuesOptions<T extends FormData> {
  /** 基线种子，取 initialValues ?? modelValue，只在 setup 期读一次。 */
  seed: DeepPartial<T> | T | undefined;
  /** 读取当前 schema，用于把 defaultValue 补进基线。 */
  getSchema: () => DynamicFormSchema<T>;
  /** 值变化通知；fieldsChanged 为空数组表示整体更新。 */
  onChange: (values: T, fieldsChanged: string[]) => void;
}

/**
 * 表单值的唯一持有者：读写、深合并、重置基线都在这里。
 * 所有写入都原地进行，保证根对象与已有嵌套引用稳定，Antdv Form 的 model 不会被换掉。
 */
export function useFormValues<T extends FormData>(options: UseFormValuesOptions<T>) {
  // schema.defaultValue 只在建立基线时补齐，resetFields 始终回到这份快照。
  let baseline = applySchemaDefaults(options.seed, options.getSchema());
  const values = ref(cloneValue(baseline)) as Ref<T>;

  function getValues(): T {
    return cloneValue(values.value);
  }

  /** 深合并部分值；数组整体替换，避免按索引残留旧数据。 */
  function setValues(nextValues: DeepPartial<T>): void {
    const merged = mergeValues(values.value, nextValues);
    if (isEqual(merged, values.value)) return;

    syncValues(values.value, merged);
    options.onChange(getValues(), []);
  }

  function getFieldValue(fieldName: FormPath): unknown {
    return cloneDeep(get(values.value, normalizePath(fieldName)));
  }

  function setFieldValue(fieldName: FormPath, value: unknown): void {
    const path = normalizePath(fieldName);
    if (isEqual(get(values.value, path), value)) return;

    set(values.value, path, cloneValue(value));
    options.onChange(getValues(), [pathToString(path)]);
  }

  /** 受控 modelValue 回流：原地同步，不触发 onChange，避免与外部形成回环。 */
  function syncExternalValues(nextValues: T): void {
    if (isEqual(values.value, nextValues)) return;
    syncValues(values.value, nextValues);
  }

  /** 只把值恢复到基线；Antdv 校验状态与事件由宿主统一处理。 */
  function resetValues(fieldNames?: FormPath[]): void {
    if (!fieldNames?.length) {
      syncValues(values.value, baseline);
      return;
    }

    for (const fieldName of fieldNames) {
      const path = normalizePath(fieldName);
      const initialValue = get(baseline, path);
      if (initialValue === undefined) unset(values.value, path);
      else set(values.value, path, cloneValue(initialValue));
    }
  }

  /** initialValues 变更只移动基线，不覆盖用户已经输入的内容。 */
  function rebaseline(seed: DeepPartial<T> | undefined): void {
    baseline = applySchemaDefaults(seed, options.getSchema());
  }

  return {
    values,
    getValues,
    setValues,
    getFieldValue,
    setFieldValue,
    syncExternalValues,
    resetValues,
    rebaseline,
  };
}
