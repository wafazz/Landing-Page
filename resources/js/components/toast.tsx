import { useEffect, useState } from 'react';
import { Toast as BsToast } from 'react-bootstrap';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
    id: number;
    type: ToastType;
    message: string;
}

let listeners: ((items: ToastItem[]) => void)[] = [];
let queue: ToastItem[] = [];
let nextId = 1;

function notify() {
    listeners.forEach(l => l([...queue]));
}

function push(type: ToastType, message: string) {
    const id = nextId++;
    queue = [...queue, { id, type, message }];
    notify();
    const ttl = type === 'error' ? 5000 : 4000;
    setTimeout(() => {
        queue = queue.filter(t => t.id !== id);
        notify();
    }, ttl);
}

export const toast = {
    success: (msg: string) => push('success', msg),
    error: (msg: string) => push('error', msg),
    info: (msg: string) => push('info', msg),
    warning: (msg: string) => push('warning', msg),
};

const bgClass: Record<ToastType, string> = {
    success: 'success',
    error: 'danger',
    info: 'info',
    warning: 'warning',
};

const iconClass: Record<ToastType, string> = {
    success: 'bi-check-circle-fill',
    error: 'bi-exclamation-triangle-fill',
    info: 'bi-info-circle-fill',
    warning: 'bi-exclamation-circle-fill',
};

export function Toaster() {
    const [items, setItems] = useState<ToastItem[]>([]);

    useEffect(() => {
        listeners.push(setItems);
        return () => {
            listeners = listeners.filter(l => l !== setItems);
        };
    }, []);

    return (
        <div className="toast-stack">
            {items.map(t => (
                <BsToast key={t.id} bg={bgClass[t.type]} className="text-white">
                    <BsToast.Body className="d-flex align-items-center">
                        <i className={`bi ${iconClass[t.type]} me-2`}></i>
                        {t.message}
                    </BsToast.Body>
                </BsToast>
            ))}
        </div>
    );
}
