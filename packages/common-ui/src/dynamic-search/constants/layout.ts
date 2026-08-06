import type { DynamicSearchColumns } from '../types';

export const DEFAULT_SEARCH_COLUMNS: DynamicSearchColumns = 4;

/** 列间距，宽度 calc 里扣除的 gap 总量必须与它保持一致。 */
export const DYNAMIC_SEARCH_GAP_CLASS = 'gap-x-4';

/** items-start 让字段保持自身高度，否则 vertical 下标签会被拉伸变高。 */
export const DYNAMIC_SEARCH_FORM_CLASS = `flex flex-wrap items-start ${DYNAMIC_SEARCH_GAP_CLASS}`;

/**
 * flex-wrap 是列数很多（列宽小于按钮组宽度）时的兜底：
 * 按钮在自己的盒子里换行，而不是溢出去压到相邻字段上。
 */
/**
 * grow 而不是 ml-auto：两者都能把按钮顶到行尾，但 grow 会让盒子吃掉本行剩余空间。
 * 于是按钮独占一行时可以用满整行宽度（不会被压成一列而多余换行），
 * 与字段同行时又只吃掉那一列的空位。配合 justify-end 保持按钮始终靠右。
 */
export const DYNAMIC_SEARCH_ACTIONS_CLASS =
  'mb-6 flex shrink-0 grow flex-wrap self-end items-center justify-end gap-2';

/**
 * inline 布局的横向间距由 antdv 的 .ant-form-inline 用 margin-inline-end 负责，这里不再叠加 gap-x。
 * 但它的表单项 margin-bottom 是 0，字段换行时上下会贴在一起，所以只补一个行间距。
 */
export const DYNAMIC_SEARCH_INLINE_FORM_CLASS = 'flex flex-wrap items-start gap-y-4';

/** inline 布局按 antdv 自身的行内流排版，按钮跟在字段后面即可，不占列宽也不吸到最右。 */
export const DYNAMIC_SEARCH_INLINE_ACTIONS_CLASS = 'flex shrink-0 items-center gap-2';

export const RESPONSIVE_FIELD_CLASSES: Record<DynamicSearchColumns, string> = {
  1: 'w-full',
  2: 'w-full md:w-[calc((100%_-_1rem)/2)]',
  3: 'w-full md:w-[calc((100%_-_1rem)/2)] xl:w-[calc((100%_-_2rem)/3)]',
  4: 'w-full md:w-[calc((100%_-_1rem)/2)] lg:w-[calc((100%_-_2rem)/3)] xl:w-[calc((100%_-_3rem)/4)]',
  5: 'w-full md:w-[calc((100%_-_1rem)/2)] lg:w-[calc((100%_-_2rem)/3)] xl:w-[calc((100%_-_3rem)/4)] 2xl:w-[calc((100%_-_4rem)/5)]',
  6: 'w-full md:w-[calc((100%_-_1rem)/2)] lg:w-[calc((100%_-_2rem)/3)] xl:w-[calc((100%_-_3rem)/4)] 2xl:w-[calc((100%_-_5rem)/6)]',
};

export const FIXED_FIELD_CLASSES: Record<DynamicSearchColumns, string> = {
  1: 'w-full',
  2: 'w-[calc((100%_-_1rem)/2)]',
  3: 'w-[calc((100%_-_2rem)/3)]',
  4: 'w-[calc((100%_-_3rem)/4)]',
  5: 'w-[calc((100%_-_4rem)/5)]',
  6: 'w-[calc((100%_-_5rem)/6)]',
};
