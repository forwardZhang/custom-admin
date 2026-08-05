import type { Ref } from 'vue';

import { get, isEqual, set, unset } from 'lodash-es';
import { ref } from 'vue';

import { normalizePath, pathToString } from '../utils/path';
import { applySchemaDefaults } from '../utils/schema';
import { cloneValue, mergeValues, syncValues, toReadonlyValue } from '../utils/value';

import type { DeepPartial, DynamicFormSchema, FormData, FormPath } from '../types';

export interface UseFormValuesOptions<T extends FormData> {
  /** 基线种子，取 initialValues，只在 setup 期读一次。 */
  seed: DeepPartial<T> | T | undefined;
  /** 读取当前 schema，用于把 defaultValue 补进基线。 */
  getSchema: () => DynamicFormSchema<T>;
  /** 值变化通知；fieldsChanged 为空数组表示整体更新。 */
  onChange: (values: Readonly<T>, fieldsChanged: string[]) => void;
}

/**
 * 表单值的唯一持有者：读写、深合并、重置基线都在这里。
 * 所有写入都原地进行，保证根对象与已有嵌套引用稳定，Antdv Form 的 model 不会被换掉。
 */
export function useFormValues<T extends FormData>(options: UseFormValuesOptions<T>) {
  // schema.defaultValue 只在建立基线时补齐，resetFields 始终回到这份快照。
  let baseline = applySchemaDefaults(options.seed, options.getSchema());
  const values = ref(cloneValue(baseline)) as Ref<T>;

  // 只读视图缓存：所有写入都原地进行，values.value 的引用在整个生命周期内不变，
  // 所以这个代理建一次就够。引用稳定也让调用方可以直接做等值判断。
  let readonlyCache: { source: T; view: Readonly<T> } | undefined;

  /**
   * 当前值的只读视图，O(1)。
   * 不是快照：内容随表单变化。需要冻结某一时刻的值请自行 cloneDeep。
   */
  function getValues(): Readonly<T> {
    const source = values.value;
    if (readonlyCache?.source !== source) {
      readonlyCache = { source, view: toReadonlyValue(source) as Readonly<T> };
    }
    return readonlyCache.view;
  }

  /** 深合并部分值；数组整体替换，避免按索引残留旧数据。 */
  function setValues(nextValues: DeepPartial<T>): void {
    const merged = mergeValues(values.value, nextValues);
    if (isEqual(merged, values.value)) return;

    syncValues(values.value, merged);
    options.onChange(getValues(), []);
  }

  /** 与 getValues 一致：对象返回只读视图，原始值直接返回。 */
  function getFieldValue(fieldName: FormPath): unknown {
    return toReadonlyValue(get(values.value, normalizePath(fieldName)));
  }

  function setFieldValue(fieldName: FormPath, value: unknown): void {
    const path = normalizePath(fieldName);
    if (isEqual(get(values.value, path), value)) return;

    set(values.value, path, cloneValue(value));
    options.onChange(getValues(), [pathToString(path)]);
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
    resetValues,
    rebaseline,
  };
}
