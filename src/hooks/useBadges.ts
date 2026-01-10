import { useState, useEffect, useCallback } from 'react';
import { requestRepository, ticketRepository, notificationsRepository } from '../lib/unified-storage';

interface Badges {
  requests: number;
  tickets: number;
  notifications: number;
}

export function useBadges() {
  const [badges, setBadges] = useState<Badges>({
    requests: 0,
    tickets: 0,
    notifications: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadBadges = useCallback(async () => {
    try {
      const [requests, tickets, notifications] = await Promise.all([
        requestRepository.getByStatus('pending'),
        ticketRepository.getByStatus('open'),
        notificationsRepository.getUnreadCount('admin'),
      ]);

      setBadges({
        requests: requests.length,
        tickets: tickets.length,
        notifications,
      });
    } catch (error) {
      console.error('Failed to load badges:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBadges();
  }, [loadBadges]);

  return { badges, loading, refetch: loadBadges };
}
