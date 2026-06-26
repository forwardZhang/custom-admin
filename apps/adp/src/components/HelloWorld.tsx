import { defineComponent, ref, type PropType } from 'vue';

export default defineComponent({
  name: 'HelloWorld',
  props: {
    msg: {
      type: String as PropType<string>,
      default: 'Hello, ADP!',
    },
    initialCount: {
      type: Number as PropType<number>,
      default: 0,
    },
  },
  setup(props) {
    const count = ref(props.initialCount);

    const increment = () => {
      count.value++;
    };

    return () => (
      <div class="hello-world">
        <h2 class="hello-world__title">{props.msg}</h2>
        <p class="hello-world__subtitle">这是一个 TSX 组件示例</p>
        <div class="hello-world__counter">
          <button class="hello-world__btn" onClick={increment}>
            Clicked {count.value} {count.value === 1 ? 'time' : 'times'}
          </button>
        </div>
      </div>
    );
  },
});
