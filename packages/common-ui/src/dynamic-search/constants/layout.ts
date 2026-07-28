import type { DynamicSearchColumns } from '../types';

export const DEFAULT_SEARCH_COLUMNS: DynamicSearchColumns = 4;

export const DYNAMIC_SEARCH_FORM_CLASS = 'flex flex-wrap gap-x-6';

export const DYNAMIC_SEARCH_ACTIONS_CLASS =
  'mb-6 ml-auto flex shrink-0 self-end items-center justify-end gap-2';

export const RESPONSIVE_FIELD_CLASSES: Record<DynamicSearchColumns, string> = {
  1: 'w-full',
  2: 'w-full md:w-[calc((100%_-_1.5rem)/2)]',
  3: 'w-full md:w-[calc((100%_-_1.5rem)/2)] xl:w-[calc((100%_-_3rem)/3)]',
  4: 'w-full md:w-[calc((100%_-_1.5rem)/2)] lg:w-[calc((100%_-_3rem)/3)] xl:w-[calc((100%_-_4.5rem)/4)]',
  5: 'w-full md:w-[calc((100%_-_1.5rem)/2)] lg:w-[calc((100%_-_3rem)/3)] xl:w-[calc((100%_-_4.5rem)/4)] 2xl:w-[calc((100%_-_6rem)/5)]',
  6: 'w-full md:w-[calc((100%_-_1.5rem)/2)] lg:w-[calc((100%_-_3rem)/3)] xl:w-[calc((100%_-_4.5rem)/4)] 2xl:w-[calc((100%_-_7.5rem)/6)]',
};

export const FIXED_FIELD_CLASSES: Record<DynamicSearchColumns, string> = {
  1: 'w-full',
  2: 'w-[calc((100%_-_1.5rem)/2)]',
  3: 'w-[calc((100%_-_3rem)/3)]',
  4: 'w-[calc((100%_-_4.5rem)/4)]',
  5: 'w-[calc((100%_-_6rem)/5)]',
  6: 'w-[calc((100%_-_7.5rem)/6)]',
};
