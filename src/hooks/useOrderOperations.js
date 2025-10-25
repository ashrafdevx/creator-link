import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as orderApi from '@/api/orderApi';

// Helper function to extract error message from API response
const getErrorMessage = (error) => {
  // Check if there are validation errors in the response
  if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    // Get the first validation error message
    const validationError = error.response.data.errors[0];
    return validationError.message || 'Validation error occurred';
  }

  // Check for general error message
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // Fallback to error.message or generic message
  return error?.message || 'An unexpected error occurred';
};

// Fetch orders list with filters
export const useOrders = (filters = {}) => {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => orderApi.getOrders(filters),
    keepPreviousData: true,
  });
};

// Fetch single order details
export const useOrderDetail = (orderId, enabled = true) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderApi.getOrderById(orderId),
    enabled: !!orderId && enabled,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
};

// Fetch order by order number
export const useOrderByNumber = (orderNumber, enabled = true) => {
  return useQuery({
    queryKey: ['order-number', orderNumber],
    queryFn: () => orderApi.getOrderByNumber(orderNumber),
    enabled: !!orderNumber && enabled,
  });
};

// Fetch order statistics
export const useOrderStats = () => {
  return useQuery({
    queryKey: ['order-stats'],
    queryFn: orderApi.getOrderStats,
  });
};

// Deliver order mutation
export const useDeliverOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderApi.deliverOrder,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['order', variables.orderId]);
      queryClient.invalidateQueries(['orders']);
      // Success toast handled in component
    },
    // Error handled in component with proper validation message extraction
  });
};

// Request revision mutation
export const useRequestRevision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderApi.requestRevision,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['order', variables.orderId]);
      queryClient.invalidateQueries(['orders']);
      // Success toast handled in component
    },
    // Error handled in component with proper validation message extraction
  });
};

// Complete order mutation
export const useCompleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderApi.completeOrder,
    onSuccess: (data, orderId) => {
      queryClient.invalidateQueries(['order', orderId]);
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['order-stats']);
      // Success toast handled in component
    },
    // Error handled in component with proper validation message extraction
  });
};

// Cancel order mutation
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderApi.cancelOrder,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['order', variables.orderId]);
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['order-stats']);
      // Success toast handled in component
    },
    // Error handled in component with proper validation message extraction
  });
};

// Add message to timeline mutation
export const useAddOrderMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderApi.addOrderMessage,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['order', variables.orderId]);
      // Success toast handled in component
    },
    // Error handled in component with proper validation message extraction
  });
};

// Rate order mutation
export const useRateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderApi.rateOrder,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['order', variables.orderId]);
      queryClient.invalidateQueries(['orders']);
      // Success toast handled in component
    },
    // Error handled in component with proper validation message extraction
  });
};

// Extend deadline mutation
export const useExtendDeadline = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderApi.extendDeadline,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['order', variables.orderId]);
      queryClient.invalidateQueries(['orders']);
      toast.success('Deadline extended successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to extend deadline');
    },
  });
};

// Dispute order mutation
export const useDisputeOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderApi.disputeOrder,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['order', variables.orderId]);
      queryClient.invalidateQueries(['orders']);
      toast.warning('Dispute opened. Our team will review and respond soon.');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to open dispute');
    },
  });
};