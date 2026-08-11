import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import PopupModal, { PopupVariant, PopupModalProps } from '../components/shared/PopupModal';
import { useAuth } from './AuthContext';
import {
  fetchMyOrders,
  fetchSellerOrders,
  fetchRiderAvailableOrders,
  fetchRiderActiveOrders,
} from '../services/orderService';
import type { Order } from '../models/order';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'order_status' | 'new_order' | 'delivery_job' | 'system';
  orderId?: string;
  timestamp: string;
  read: boolean;
  role: string;
}

export interface ShowPopupOptions {
  title: string;
  message: string;
  variant?: PopupVariant;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  autoDismissMs?: number;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface NotificationContextValue {
  showPopup: (options: ShowPopupOptions) => void;
  hidePopup: () => void;
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();

  // ── Popup Modal State ──────────────────────────────────────────────────────
  const [popupState, setPopupState] = useState<PopupModalProps>({
    visible: false,
    title: '',
    message: '',
    variant: 'info',
  });

  const showPopup = useCallback((options: ShowPopupOptions) => {
    setPopupState({
      visible: true,
      title: options.title,
      message: options.message,
      variant: options.variant || 'info',
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || 'Cancel',
      showCancel: options.showCancel || false,
      autoDismissMs: options.autoDismissMs,
      onConfirm: () => {
        setPopupState((prev) => ({ ...prev, visible: false }));
        if (options.onConfirm) options.onConfirm();
      },
      onCancel: () => {
        setPopupState((prev) => ({ ...prev, visible: false }));
        if (options.onCancel) options.onCancel();
      },
    });
  }, []);

  const hidePopup = useCallback(() => {
    setPopupState((prev) => ({ ...prev, visible: false }));
  }, []);

  // ── Notifications State ───────────────────────────────────────────────────
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Maps orderId -> last known status to detect state changes
  const prevStatusMap = useRef<Record<string, string>>({});
  const knownOrderIds = useRef<Set<string>>(new Set());

  const addNotification = useCallback((item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...item,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };

    setNotifications((prev) => [newNotif, ...prev]);

    // Also trigger a popup toast for high priority order events
    showPopup({
      title: item.title,
      message: item.message,
      variant: item.type === 'new_order' ? 'warning' : 'success',
      autoDismissMs: 4000,
    });
  }, [showPopup]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // ── Order-Based Role-Filtered Notification Scheduler ──────────────────────
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    let isSubscribed = true;

    const pollOrderScheduler = async () => {
      try {
        if (user.role === 'buyer') {
          // BUYER SCHEDULER: Check status of buyer's own placed orders ONLY
          const myOrders: Order[] = await fetchMyOrders().catch(() => []);
          if (!isSubscribed) return;

          myOrders.forEach((ord) => {
            const lastStatus = prevStatusMap.current[ord.id];
            if (lastStatus && lastStatus !== ord.status) {
              // Status changed for this buyer's specific order!
              const statusLabels: Record<string, string> = {
                confirmed: 'accepted by the restaurant 🍳',
                preparing: 'being prepared by chef 👩‍🍳',
                ready: 'ready for pickup 📦',
                assigned: 'rider assigned & heading to the restaurant 🛵',
                on_the_way: 'on the way with driver 🛵',
                reached: 'rider arrived at your location 📍',
                delivered: 'delivered successfully! Enjoy your meal 🎉',
                cancelled: 'cancelled ❌',
              };

              const statusDesc = statusLabels[ord.status] || `updated to ${ord.status}`;
              addNotification({
                title: `Order Update #${ord.id.slice(-6)}`,
                message: `Your order from ${ord.restaurantName || 'Restaurant'} is ${statusDesc}`,
                type: 'order_status',
                orderId: ord.id,
                role: 'buyer',
              });
            }
            prevStatusMap.current[ord.id] = ord.status;
          });
        } else if (user.role === 'seller') {
          // SELLER SCHEDULER: Check incoming order requests for seller's restaurant ONLY
          const sellerOrders: Order[] = await fetchSellerOrders().catch(() => []);
          if (!isSubscribed) return;

          sellerOrders.forEach((ord) => {
            if (!knownOrderIds.current.has(ord.id) && ord.status === 'pending') {
              knownOrderIds.current.add(ord.id);
              addNotification({
                title: 'New Order Received! 🔔',
                message: `Order #${ord.id.slice(-6)} received from ${ord.customerName || 'Customer'} ($${ord.total.toFixed(2)})`,
                type: 'new_order',
                orderId: ord.id,
                role: 'seller',
              });
            }
            prevStatusMap.current[ord.id] = ord.status;
          });
        } else if (user.role === 'rider') {
          // RIDER SCHEDULER: Check available pickup jobs and active delivery status
          const availableJobs: Order[] = await fetchRiderAvailableOrders().catch(() => []);
          if (!isSubscribed) return;

          availableJobs.forEach((job) => {
            if (!knownOrderIds.current.has(job.id)) {
              knownOrderIds.current.add(job.id);
              addNotification({
                title: 'New Delivery Available 🛵',
                message: `Order #${job.id.slice(-6)} ready at ${job.restaurantName || 'Restaurant'}`,
                type: 'delivery_job',
                orderId: job.id,
                role: 'rider',
              });
            }
          });
        }
      } catch {
        // Ignore network polling errors
      }
    };

    // Run immediately then poll every 10 seconds
    pollOrderScheduler();
    const interval = setInterval(pollOrderScheduler, 10000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [isAuthenticated, user, addNotification]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        showPopup,
        hidePopup,
        notifications,
        unreadCount,
        markAsRead,
        clearNotifications,
      }}
    >
      {children}
      <PopupModal {...popupState} />
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationProvider>');
  return ctx;
}
