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
  success: (message: string, description?: string, options?: unknown) => {
    toast.success(message, {
      description,
      ...options,
    });
  },

  /**
   * Exibe uma mensagem de erro.
   */
  error: (message: string, description?: string, options?: unknown) => {
    toast.error(message, {
      description,
      ...options,
    });
  },

  /**
   * Exibe uma mensagem de informação.
   */
  info: (message: string, description?: string, options?: unknown) => {
    toast.info(message, {
      description,
      ...options,
    });
  },

  /**
   * Exibe uma mensagem de alerta.
   */
  warning: (message: string, description?: string, options?: unknown) => {
    toast.warning(message, {
      description,
      ...options,
    });
  },

  /**
   * Exibe uma mensagem de carregamento que pode ser atualizada.
   * Retorna o ID da notificação para que possa ser usada com .dismiss() ou .success()/.error()
   */
  loading: (message: string, description?: string, options?: unknown) => {
    return toast.loading(message, {
      description,
      ...options,
    });
  },

  /**
   * Dispara um toast customizado ou genérico
   */
  message: (message: string, description?: string, options?: unknown) => {
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
    const message = error?.response?.data?.message || error?.message || defaultMessage;
    toast.error(message);
  },
};
