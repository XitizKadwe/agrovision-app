import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // <-- THE FIX IS HERE

function NotificationsPage() {
    const { token } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch('/api/notifications', {
                    headers: { 'x-auth-token': token }
                });
                const data = await res.json();
                setNotifications(data);
            } catch (err) {
                console.error("Failed to fetch notifications", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (token) {
            fetchNotifications();
        }
    }, [token]);
    
    const handleMarkAsRead = async (id) => {
        console.log(`Marking ${id} as read.`);
        await fetch(`/api/notifications/${id}/mark-as-read`, {
            method: 'POST',
            headers: { 'x-auth-token': token }
        });
    };

    if (isLoading) {
        return <div className="container">Loading notifications...</div>;
    }

    return (
        <div className="container notifications-page">
            <h1>Notifications</h1>
            {notifications.length > 0 ? (
                <ul className="notification-list">
                    {notifications.map(notif => (
                        <li key={notif._id} className={notif.isRead ? 'read' : 'unread'}>
                            <div className="notif-content">
                                <h3>{notif.title}</h3>
                                <p>{notif.summary}</p>
                                <a href={notif.sourceUrl} target="_blank" rel="noopener noreferrer" className="source-link">
                                    Read More
                                </a>
                            </div>
                            <div className="notif-meta">
                                <span>{new Date(notif.publishDate).toLocaleDateString()}</span>
                                {!notif.isRead && (
                                     <button onClick={() => handleMarkAsRead(notif._id)}>Mark as Read</button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>You have no notifications.</p>
            )}
        </div>
    );
}

export default NotificationsPage;