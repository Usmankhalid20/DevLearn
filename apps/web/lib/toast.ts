import { toast, type ToastOptions } from 'react-toastify';
import { formatErrorMessage } from './api';

const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'dark',
};

export const showToast = {
  success(message: string, options?: ToastOptions) {
    toast.success(message, { ...defaultOptions, ...options });
  },
  error(error: unknown, options?: ToastOptions) {
    const message = formatErrorMessage(error);
    toast.error(message, { ...defaultOptions, ...options });
  },
  info(message: string, options?: ToastOptions) {
    toast.info(message, { ...defaultOptions, ...options });
  },
  warning(message: string, options?: ToastOptions) {
    toast.warning(message, { ...defaultOptions, ...options });
  },
};

export { toast };
