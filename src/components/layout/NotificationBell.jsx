import React, { useState, useEffect, Fragment } from 'react';
import { useAuth } from '../../context/AuthContext'; // Adjust path as needed
import { Link } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';

function NotificationBell() {
    const { token } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [recentNotifs, setRecentNotifs] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    // Fetch unread count
    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const res = await fetch('/api/notifications/unread-count', {
                    headers: { 'x-auth-token': token }
                });
                const data = await res.json();
                setUnreadCount(data.count);
            } catch (err) {
                console.error("Could not fetch unread count", err);
            }
        };
        if (token) {
            fetchUnreadCount();
        }
    }, [token]);

    // Fetch recent notifications when the panel is opened
    const togglePanel = async () => {
        if (!isOpen) {
            try {
                const res = await fetch('/api/notifications?limit=5', { // Assuming your API supports a limit
                    headers: { 'x-auth-token': token }
                });
                const data = await res.json();
                setRecentNotifs(data.slice(0, 5)); // Manually slice if API doesn't limit
            } catch (err) {
                console.error("Could not fetch recent notifications", err);
            }
        }
        setIsOpen(!isOpen);
    };

    return (
        <div className="notification-bell">
            <button
                onClick={togglePanel}
                className="icon-button"
                style={{
                    backgroundColor: "#16a34a", // Tailwind's bg-green-600 hex
                    border: "none",
                    borderRadius: "50%",
                    padding: "10px",
                    cursor: "pointer"
                }}
            >
                <FaBell />
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>
            {isOpen && (
                <div className="notification-panel">
                    <div className="panel-header">Notifications</div>
                    <ul className="panel-list">
                        {recentNotifs.length > 0 ? (
                            recentNotifs.map(notif => (
                                <li key={notif._id}>{notif.title}</li>
                            ))
                        ) : (
                            <li className="empty">No new notifications</li>
                        )}
                    </ul>
                    <div className="panel-footer">
                        <Link to="/notifications" onClick={() => setIsOpen(false)}>
                            View All Notifications
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationBell;