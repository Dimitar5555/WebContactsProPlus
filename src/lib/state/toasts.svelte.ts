export class ToastStore {
    toasts = $state<Toast[]>([]);

    constructor() {}

    add(message: string | null, type: 'success' | 'error' | 'warning', duration = 3000) {
        if(!message) return;
        const id = Date.now();
        const timeoutId = window.setTimeout(() => {
            this.toasts = this.toasts.filter((t) => t.id !== id);
        }, duration);
        this.toasts = [{ id, message, type, timeoutId }, ...this.toasts];
    };

    remove(id: number) {
        const toast = this.toasts.find((t) => t.id === id);
        if(toast) {
            clearTimeout(toast.timeoutId);
            this.toasts = this.toasts.filter((t) => t.id !== id);
        }
    };
}
