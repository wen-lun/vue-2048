import type { ComponentObjectPropsOptions } from 'vue';

export function buildProps<T extends ComponentObjectPropsOptions>(props: T) {
    return props;
}
