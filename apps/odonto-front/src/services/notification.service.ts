import { toast } from 'sonner';

/**
 * Serviço de notificação centralizado para a aplicação.
 * Envolve a biblioteca 'sonner' para facilitar substituições futuras
 * e garantir consistência na exibição de mensagens.
 */
export const notificationService = {
  /**
   * Exibe uma mensagem de sucesso.
   */
  success: (message: string, description?: string, options?: Record<string, unknown>) => {
    toast.success(message, {
      description,
      ...options,
    });
  },

  /**
   * Exibe uma mensagem de erro.
   */
  error: (message: string, description?: string, options?: Record<string, unknown>) => {
    toast.error(message, {
      description,
      ...options,
    });
  },

  /**
   * Exibe uma mensagem de informação.
   */
  info: (message: string, description?: string, options?: Record<string, unknown>) => {
    toast.info(message, {
      description,
      ...options,
    });
  },

  /**
   * Exibe uma mensagem de alerta.
   */
  warning: (message: string, description?: string, options?: Record<string, unknown>) => {
    toast.warning(message, {
      description,
      ...options,
    });
  },

  /**
   * Exibe uma mensagem de carregamento que pode ser atualizada.
   * Retorna o ID da notificação para que possa ser usada com .dismiss() ou .success()/.error()
   */
  loading: (message: string, description?: string, options?: Record<string, unknown>) => {
    return toast.loading(message, {
      description,
      ...options,
    });
  },

  /**
   * Dispara um toast customizado ou genérico
   */
  message: (message: string, description?: string, options?: Record<string, unknown>) => {
    toast(message, {
      description,
      ...options,
    });
  },

  /**
   * Remove uma notificação específica pelo ID.
   */
  dismiss: (id?: string | number) => {
    toast.dismiss(id);
  },

  /**
   * Atalho para lidar com erros de API
   */
  apiError: (error: unknown, defaultMessage: string = 'Ocorreu um erro inesperado') => {
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    const message = err?.response?.data?.message || err?.message || defaultMessage;
    toast.error(message);
  },
};
