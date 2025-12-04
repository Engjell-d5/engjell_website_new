'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';

export default function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSupport();
    checkSubscription();
  }, []);

  const checkSupport = () => {
    if (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    ) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }
  };

  const checkSubscription = async () => {
    try {
      // Check if service worker is already registered
      let registration = await navigator.serviceWorker.getRegistration();
      
      // If not registered, try to register it
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });
      }
      
      // Wait for service worker to be ready using navigator.serviceWorker.ready
      await navigator.serviceWorker.ready;
      
      // Get the active registration after ready
      registration = await navigator.serviceWorker.getRegistration();
      
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } else {
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      // If service worker fails, still allow the button to be clickable
      setIsSubscribed(false);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    let permission = Notification.permission;

    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    return permission;
  };

  const subscribe = async () => {
    try {
      setIsLoading(true);

      // Request notification permission
      await requestPermission();

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      // Wait for service worker to be ready
      await registration.update();

      // Get VAPID public key from environment or API
      let publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      
      if (!publicKey) {
        // Try to get from API
        const keyResponse = await fetch('/api/push/vapid-key');
        if (!keyResponse.ok) {
          throw new Error('VAPID public key not configured. Please set NEXT_PUBLIC_VAPID_PUBLIC_KEY in your environment variables.');
        }
        const keyData = await keyResponse.json();
        publicKey = keyData.publicKey;
      }

      if (!publicKey) {
        throw new Error('VAPID public key not configured');
      }

      // Convert VAPID key to Uint8Array
      const applicationServerKey = urlBase64ToUint8Array(publicKey);

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as unknown as BufferSource,
      });

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription }),
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe to push notifications');
      }

      setIsSubscribed(true);
    } catch (error: any) {
      console.error('Error subscribing to push notifications:', error);
      alert(error.message || 'Failed to enable push notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    try {
      setIsLoading(true);

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from push notifications
        await subscription.unsubscribe();

        // Remove subscription from server
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        setIsSubscribed(false);
      }
    } catch (error: any) {
      console.error('Error unsubscribing from push notifications:', error);
      alert(error.message || 'Failed to disable push notifications');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert VAPID key
  function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  if (!isSupported) {
    return null; // Don't show anything if not supported
  }

  if (isLoading) {
    return (
      <button
        disabled
        className="p-2 border border-[var(--border-color)] text-gray-400 cursor-not-allowed"
        title="Loading..."
      >
        <Bell className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={isSubscribed ? unsubscribe : subscribe}
      className={`p-2 border transition-colors cursor-pointer relative z-10 ${
        isSubscribed
          ? 'border-[var(--primary-mint)] text-[var(--primary-mint)]'
          : 'border-[var(--border-color)] text-gray-400 hover:text-white'
      }`}
      title={isSubscribed ? 'Disable push notifications' : 'Enable push notifications'}
      type="button"
      aria-label={isSubscribed ? 'Disable push notifications' : 'Enable push notifications'}
    >
      {isSubscribed ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
    </button>
  );
}
