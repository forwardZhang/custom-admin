import { request } from '@/utils/request';

export interface DynamicFormOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface IndustryOptionResponse {
  data: Array<{
    code: string;
    name: string;
    disabled?: boolean;
  }>;
}

export function getIndustryOptionsApi(
  customerType: string | undefined,
  signal?: AbortSignal,
): Promise<IndustryOptionResponse> {
  return request.get<IndustryOptionResponse>(
    '/dynamic-form/options/industries',
    { customerType },
    { signal },
  );
}

export function getNotificationOptionsApi(signal?: AbortSignal): Promise<DynamicFormOption[]> {
  return request.get<DynamicFormOption[]>('/dynamic-form/options/notifications', undefined, {
    signal,
  });
}
