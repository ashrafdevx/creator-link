/**
 * Admin Service
 * API service for admin dashboard operations with automatic JWT token management
 */

import { makeAuthenticatedRequest } from '@/utils/authUtils.js';

const createAdminService = () => {
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  // Validate base URL on initialization
  if (!baseURL) {
    console.error("VITE_API_BASE_URL is not defined in environment variables");
  }

  /**
   * Get dashboard statistics and overview
   * GET /api/admin/dashboard
   */
  const getDashboardStats = async () => {
    try {
      const response = await makeAuthenticatedRequest("/api/admin/dashboard");
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch dashboard stats: ${error.message}`);
    }
  };

  /**
   * Get all users with filtering and pagination
   * GET /api/admin/users?page=1&limit=10&search=&role=&status=
   */
  const getAllUsers = async ({ page = 1, limit = 10, search = '', role = '', status = '' } = {}) => {
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      if (search) params.append('search', search);
      if (role) params.append('role', role);
      if (status) params.append('status', status);

      const response = await makeAuthenticatedRequest(`/api/admin/users?${params.toString()}`);
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  };

  /**
   * Get specific user details
   * GET /api/admin/users/:id
   */
  const getUserDetails = async (userId) => {
    try {
      const response = await makeAuthenticatedRequest(`/api/admin/users/${userId}`);
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch user details: ${error.message}`);
    }
  };

  /**
   * Update user status (active/inactive/suspended)
   * PATCH /api/admin/users/:id/status
   */
  const updateUserStatus = async (userId, status) => {
    try {
      const response = await makeAuthenticatedRequest(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to update user status: ${error.message}`);
    }
  };

  /**
   * Get user activity logs
   * GET /api/admin/users/:id/activity
   */
  const getUserActivity = async (userId) => {
    try {
      const response = await makeAuthenticatedRequest(`/api/admin/users/${userId}/activity`);
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch user activity: ${error.message}`);
    }
  };

  /**
   * Delete user account (soft delete)
   * DELETE /api/admin/users/:id
   */
  const deleteUser = async (userId) => {
    try {
      const response = await makeAuthenticatedRequest(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  };

  /**
   * Suspend user account
   * PATCH /api/admin/users/:id/suspend
   */
  const suspendUser = async (userId, { reason, duration = 'permanent', notifyUser = true }) => {
    try {
      const response = await makeAuthenticatedRequest(`/api/admin/users/${userId}/suspend`, {
        method: 'PATCH',
        body: JSON.stringify({ reason, duration, notifyUser })
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to suspend user: ${error.message}`);
    }
  };

  /**
   * Unsuspend user account
   * PATCH /api/admin/users/:id/unsuspend
   */
  const unsuspendUser = async (userId, { reason, notifyUser = true }) => {
    try {
      const response = await makeAuthenticatedRequest(`/api/admin/users/${userId}/unsuspend`, {
        method: 'PATCH',
        body: JSON.stringify({ reason, notifyUser })
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to unsuspend user: ${error.message}`);
    }
  };

  /**
   * Get all transactions with filtering and pagination
   * GET /api/admin/transactions?page=1&limit=50&status=&type=&amountMin=&amountMax=&dateFrom=&dateTo=
   */
  const getAllTransactions = async ({
    page = 1,
    limit = 50,
    status = '',
    type = '',
    amountMin = '',
    amountMax = '',
    dateFrom = '',
    dateTo = '',
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = {}) => {
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      if (status) params.append('status', status);
      if (type) params.append('type', type);
      if (amountMin) params.append('amountMin', amountMin);
      if (amountMax) params.append('amountMax', amountMax);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);

      const response = await makeAuthenticatedRequest(`/api/admin/transactions?${params.toString()}`);
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }
  };

  /**
   * Get specific transaction details
   * GET /api/admin/transactions/:id
   */
  const getTransactionDetails = async (transactionId) => {
    try {
      const response = await makeAuthenticatedRequest(`/api/admin/transactions/${transactionId}`);
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch transaction details: ${error.message}`);
    }
  };

  /**
   * Release escrow funds for an order
   * POST /api/admin/escrow/:orderId/release
   */
  const releaseEscrow = async (orderId, { reason, releaseAmount, releaseNote, notifyParties = true }) => {
    try {
      const response = await makeAuthenticatedRequest(`/api/admin/escrow/${orderId}/release`, {
        method: 'POST',
        body: JSON.stringify({ reason, releaseAmount, releaseNote, notifyParties })
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to release escrow: ${error.message}`);
    }
  };

  /**
   * Process refund for a transaction
   * POST /api/admin/transactions/:id/refund
   */
  const processRefund = async (transactionId, { reason, refundAmount, refundPlatformFee = true, refundNote, notifyParties = true }) => {
    try {
      const response = await makeAuthenticatedRequest(`/api/admin/transactions/${transactionId}/refund`, {
        method: 'POST',
        body: JSON.stringify({ reason, refundAmount, refundPlatformFee, refundNote, notifyParties })
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to process refund: ${error.message}`);
    }
  };

  /**
   * Export transactions to CSV
   * GET /api/admin/transactions/export?format=csv&status=&type=&dateFrom=&dateTo=
   */
  const exportTransactions = async ({ format = 'csv', status = '', type = '', dateFrom = '', dateTo = '', includeUserData = true } = {}) => {
    try {
      const params = new URLSearchParams();
      if (format) params.append('format', format);
      if (status) params.append('status', status);
      if (type) params.append('type', type);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      if (includeUserData !== undefined) params.append('includeUserData', includeUserData);

      const response = await makeAuthenticatedRequest(`/api/admin/transactions/export?${params.toString()}`);

      // For CSV, return blob
      if (format === 'csv') {
        return await response.blob();
      }

      // For JSON, return parsed data
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to export transactions: ${error.message}`);
    }
  };

  /**
   * Get all contact messages with filtering and pagination
   * GET /api/admin/contact-messages?page=1&limit=20&status=&search=
   */
  const getAllContactMessages = async ({ page = 1, limit = 20, status = '', search = '' } = {}) => {
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      if (status) params.append('status', status);
      if (search) params.append('search', search);

      const response = await makeAuthenticatedRequest(`/api/admin/contact-messages?${params.toString()}`);
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch contact messages: ${error.message}`);
    }
  };

  /**
   * Update contact message status
   * PATCH /api/admin/contact-messages/:id
   */
  const updateContactMessageStatus = async (messageId, status) => {
    try {
      const response = await makeAuthenticatedRequest(`/api/admin/contact-messages/${messageId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to update contact message status: ${error.message}`);
    }
  };

  /**
   * Delete contact message
   * DELETE /api/admin/contact-messages/:id
   */
  const deleteContactMessage = async (messageId, { reason, confirmDelete = true }) => {
    try {
      const response = await makeAuthenticatedRequest(`/api/admin/contact-messages/${messageId}`, {
        method: 'DELETE',
        body: JSON.stringify({ reason, confirmDelete })
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to delete contact message: ${error.message}`);
    }
  };

  /**
   * Get platform analytics
   * GET /api/admin/analytics/platform?timeRange=30d&metrics=all
   */
  const getPlatformAnalytics = async ({ timeRange = '30d', metrics = 'all' } = {}) => {
    try {
      const params = new URLSearchParams();
      if (timeRange) params.append('timeRange', timeRange);
      if (metrics) params.append('metrics', metrics);

      const response = await makeAuthenticatedRequest(`/api/admin/analytics/platform?${params.toString()}`);
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch platform analytics: ${error.message}`);
    }
  };

  /**
   * Get revenue analytics
   * GET /api/admin/analytics/revenue?timeRange=30d&groupBy=day
   */
  const getRevenueAnalytics = async ({ timeRange = '30d', groupBy = 'day' } = {}) => {
    try {
      const params = new URLSearchParams();
      if (timeRange) params.append('timeRange', timeRange);
      if (groupBy) params.append('groupBy', groupBy);

      const response = await makeAuthenticatedRequest(`/api/admin/analytics/revenue?${params.toString()}`);
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch revenue analytics: ${error.message}`);
    }
  };

  /**
   * Get financial summary report
   * GET /api/admin/reports/financial-summary?period=month&year=2024&month=1
   */
  const getFinancialSummary = async ({ period = 'month', year, month, compareWithPrevious = true } = {}) => {
    try {
      const params = new URLSearchParams();
      if (period) params.append('period', period);
      if (year) params.append('year', year);
      if (month) params.append('month', month);
      if (compareWithPrevious !== undefined) params.append('compareWithPrevious', compareWithPrevious);

      const response = await makeAuthenticatedRequest(`/api/admin/reports/financial-summary?${params.toString()}`);
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch financial summary: ${error.message}`);
    }
  };

  /**
   * Get revenue trends
   * GET /api/admin/reports/revenue-trends?timeframe=12m&granularity=month
   */
  const getRevenueTrends = async ({ timeframe = '12m', granularity = 'month', includeForecasting = false } = {}) => {
    try {
      const params = new URLSearchParams();
      if (timeframe) params.append('timeframe', timeframe);
      if (granularity) params.append('granularity', granularity);
      if (includeForecasting !== undefined) params.append('includeForecasting', includeForecasting);

      const response = await makeAuthenticatedRequest(`/api/admin/reports/revenue-trends?${params.toString()}`);
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch revenue trends: ${error.message}`);
    }
  };

  /**
   * Get commission analysis
   * GET /api/admin/reports/commission-analysis?startDate=&endDate=&groupBy=month
   */
  const getCommissionAnalysis = async ({ startDate, endDate, groupBy = 'month' } = {}) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (groupBy) params.append('groupBy', groupBy);

      const response = await makeAuthenticatedRequest(`/api/admin/reports/commission-analysis?${params.toString()}`);
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch commission analysis: ${error.message}`);
    }
  };

  return {
    getDashboardStats,
    getAllUsers,
    getUserDetails,
    updateUserStatus,
    getUserActivity,
    deleteUser,
    suspendUser,
    unsuspendUser,
    getAllTransactions,
    getTransactionDetails,
    releaseEscrow,
    processRefund,
    exportTransactions,
    getAllContactMessages,
    updateContactMessageStatus,
    deleteContactMessage,
    getPlatformAnalytics,
    getRevenueAnalytics,
    getFinancialSummary,
    getRevenueTrends,
    getCommissionAnalysis,
  };
};

// Export the service instance
export const adminService = createAdminService();
