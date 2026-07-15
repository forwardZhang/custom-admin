/** 将 Schema 返回的 VNodeChild 安全地桥接到真实组件节点。 */
import { cloneVNode, defineComponent, Fragment, h, isVNode, useAttrs } from 'vue';

import type { PropType, VNodeChild } from 'vue';

export default defineComponent({
  name: 'DynamicFormVNodeRenderer',
  inheritAttrs: false,
  props: {
    content: {
      type: null as unknown as PropType<VNodeChild>,
      default: null,
    },
  },
  setup(props) {
    const attrs = useAttrs();

    return () => {
      if (Object.keys(attrs).length === 0) return props.content;

      const nodes = Array.isArray(props.content) ? props.content : [props.content];
      if (nodes.length === 1 && isVNode(nodes[0]) && nodes[0].type !== Fragment) {
        return cloneVNode(nodes[0], attrs);
      }

      if (props.content === null || props.content === undefined) return h('span', attrs);
      return h('span', attrs, props.content);
    };
  },
});
