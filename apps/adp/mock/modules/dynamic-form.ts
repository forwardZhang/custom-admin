import type { MockRoute } from '../types.ts';
import { success } from '../utils/response.ts';

const industryOptions = {
  company: [
    { name: '软件与信息服务', code: 'software' },
    { name: '智能制造', code: 'manufacturing' },
    { name: '零售与消费', code: 'retail' },
  ],
  individual: [
    { name: '个人咨询', code: 'consulting' },
    { name: '自由职业', code: 'freelance' },
  ],
};

const notificationOptions = [
  { label: '邮件', value: 'email' },
  { label: '短信', value: 'sms' },
  { label: '企业微信', value: 'wechat' },
];

function delay(duration: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

export const dynamicFormMockRoutes: MockRoute[] = [
  {
    method: 'GET',
    url: '/api/dynamic-form/options/industries',
    async handler({ req }) {
      const url = new URL(req.url ?? '', 'http://localhost');
      const customerType = url.searchParams.get('customerType');
      await delay(customerType === 'company' ? 180 : 420);

      return success({
        data: customerType === 'company' ? industryOptions.company : industryOptions.individual,
      });
    },
  },
  {
    method: 'GET',
    url: '/api/dynamic-form/options/notifications',
    async handler() {
      await delay(240);
      return success(notificationOptions);
    },
  },
];
