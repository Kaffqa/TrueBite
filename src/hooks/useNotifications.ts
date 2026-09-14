import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface Notification {
  id: string;
  user_id: string;
  type: 'alert' | 'streak' | 'info';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      // Because the table might not exist yet if the user hasn't run the SQL,
      // we wrap it in a try-catch to prevent the app from crashing.
      const { data, error } = await (supabase as any)
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        if (error.code === '42P01') {
          // Table does not exist yet. Safe to ignore during setup.
          console.warn('Notifications table not found. Please run the SQL migration.');
        } else {
          console.error('Error fetching notifications:', error);
        }
        return;
      }

      const typedData = data as Notification[] | null;
      setNotifications(typedData || []);
      setUnreadCount((typedData || []).filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Unexpected error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();

    // Set up realtime subscription
    if (!user) return;
    
    const channel = (supabase as any)
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload: any) => {
          const newNotif = payload.new as Notification;
          setNotifications(prev => [newNotif, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotifications]);

  const markAsRead = async (id: string) => {
    if (!user) return;
    
    // Optimistic UI update
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      const { error } = await (supabase as any)
        .from('notifications')
        .update({ is_read: true } as any)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      // Revert if failed (optional, keeping it simple for now)
      fetchNotifications(); 
    }
  };

  const markAllAsRead = async () => {
    if (!user || unreadCount === 0) return;

    // Optimistic UI update
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);

    try {
      const { error } = await (supabase as any)
        .from('notifications')
        .update({ is_read: true } as any)
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
    } catch (err) {
      console.error('Error marking all as read:', err);
      fetchNotifications();
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications
  };
}
