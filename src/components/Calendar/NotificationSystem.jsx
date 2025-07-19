import React, { useState, useEffect } from "react";

const NotificationSystem = ({ events, userRole, studentId }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    checkUpcomingEvents();
    const interval = setInterval(checkUpcomingEvents, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [events]);

  const checkUpcomingEvents = () => {
    const now = new Date();
    const upcomingNotifications = [];

    events.forEach(event => {
      const eventStart = new Date(event.start);
      const timeDiff = eventStart.getTime() - now.getTime();
      const minutesDiff = Math.floor(timeDiff / (1000 * 60));

      // Check for reminder notifications
      if (event.reminder && minutesDiff === event.reminder && minutesDiff > 0) {
        upcomingNotifications.push({
          id: `reminder-${event.id}`,
          type: 'reminder',
          title: `Reminder: ${event.title || event.text}`,
          message: `Your event "${event.title || event.text}" starts in ${event.reminder} minutes`,
          eventId: event.id,
          timestamp: now.toISOString(),
          priority: event.priority || 'medium'
        });
      }

      // Check for immediate notifications (starting soon)
      if (minutesDiff <= 5 && minutesDiff > 0) {
        upcomingNotifications.push({
          id: `starting-${event.id}`,
          type: 'starting_soon',
          title: `Starting Soon: ${event.title || event.text}`,
          message: `Your event starts in ${minutesDiff} minutes`,
          eventId: event.id,
          timestamp: now.toISOString(),
          priority: 'high'
        });
      }

      // Check for overdue events
      if (minutesDiff < -30) {
        upcomingNotifications.push({
          id: `overdue-${event.id}`,
          type: 'overdue',
          title: `Overdue: ${event.title || event.text}`,
          message: `This event was scheduled ${Math.abs(minutesDiff)} minutes ago`,
          eventId: event.id,
          timestamp: now.toISOString(),
          priority: 'high'
        });
      }
    });

    setNotifications(prev => {
      const existingIds = prev.map(n => n.id);
      const newNotifications = upcomingNotifications.filter(n => !existingIds.includes(n.id));
      return [...prev, ...newNotifications].slice(-10); // Keep only last 10 notifications
    });
  };

  const dismissNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'reminder': return '⏰';
      case 'starting_soon': return '🚀';
      case 'overdue': return '⚠️';
      default: return '📅';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'notification-high';
      case 'medium': return 'notification-medium';
      case 'low': return 'notification-low';
      default: return 'notification-medium';
    }
  };

  return (
    <div className="notification-system">
      <button 
        className={`notification-bell ${notifications.length > 0 ? 'has-notifications' : ''}`}
        onClick={() => setShowNotifications(!showNotifications)}
      >
        🔔
        {notifications.length > 0 && (
          <span className="notification-badge">{notifications.length}</span>
        )}
      </button>

      {showNotifications && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h4>Notifications</h4>
            <button 
              className="clear-all-btn"
              onClick={() => setNotifications([])}
            >
              Clear All
            </button>
          </div>
          
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <p>No new notifications</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`notification-item ${getPriorityClass(notification.priority)}`}
                >
                  <div className="notification-content">
                    <div className="notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-text">
                      <h5>{notification.title}</h5>
                      <p>{notification.message}</p>
                      <span className="notification-time">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <button 
                    className="dismiss-btn"
                    onClick={() => dismissNotification(notification.id)}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;