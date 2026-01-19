import { useEffect, useRef } from 'react';

type EventCallback = () => void;

class RealTimeUpdateManager {
  private listeners: Map<string, EventCallback[]> = new Map();

  subscribe(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        const index = eventListeners.indexOf(callback);
        if (index > -1) {
          eventListeners.splice(index, 1);
        }
      }
    };
  }

  emit(event: string) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback());
    }
  }
}

const realTimeUpdateManager = new RealTimeUpdateManager();

export const useRealTimeUpdates = (event: string, callback: EventCallback) => {
  const callbackRef = useRef(callback);

  // Update the ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const unsubscribe = realTimeUpdateManager.subscribe(event, () => {
      callbackRef.current();
    });

    return unsubscribe;
  }, [event]);
};

export const emitRealTimeUpdate = (event: string) => {
  realTimeUpdateManager.emit(event);
};
