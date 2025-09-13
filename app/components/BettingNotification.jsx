"use client";
import React, { useState, useEffect } from 'react';

const BettingNotification = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500/20',
          border: 'border-green-500/50',
          text: 'text-green-400',
          icon: '✅'
        };
      case 'error':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-500/50',
          text: 'text-red-400',
          icon: '❌'
        };
      case 'info':
        return {
          bg: 'bg-blue-500/20',
          border: 'border-blue-500/50',
          text: 'text-blue-400',
          icon: 'ℹ️'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/50',
          text: 'text-yellow-400',
          icon: '⚠️'
        };
      default:
        return {
          bg: 'bg-gray-500/20',
          border: 'border-gray-500/50',
          text: 'text-gray-400',
          icon: '📢'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div 
      className={`fixed top-4 right-4 z-50 max-w-sm w-full ${styles.bg} ${styles.border} border rounded-lg p-4 backdrop-blur-sm transition-all duration-300 ${
        isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">{styles.icon}</span>
        <div className="flex-1">
          <p className={`${styles.text} font-medium text-sm`}>
            {message}
          </p>
        </div>
        <button
          onClick={() => {
            setIsLeaving(true);
            setTimeout(() => {
              setIsVisible(false);
              onClose?.();
            }, 300);
          }}
          className={`${styles.text} hover:opacity-70 transition-opacity`}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export const BettingNotificationSystem = ({ notifications, onRemoveNotification }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification, index) => (
        <BettingNotification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={() => onRemoveNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default BettingNotification;

