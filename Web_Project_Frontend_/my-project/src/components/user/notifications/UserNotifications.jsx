import React, { useEffect, useState } from 'react';
import {
  deleteNotificationById,
  getMyNotifications,
  getNotificationRecipients,
  sendNotificationToUser,
} from '../../../services/user/notifications/NotificationsService';

function UserNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [recipientId, setRecipientId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const loadNotifications = async () => {
    try {
      setError('');
      const rows = await getMyNotifications();
      setNotifications(rows);
    } catch (e) {
      setError(e.message || 'Failed to load notifications');
    }
  };

  const loadRecipients = async () => {
    try {
      const rows = await getNotificationRecipients();
      setRecipients(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setError(e.message || 'Failed to load recipients');
    }
  };

  useEffect(() => {
    loadNotifications();
    loadRecipients();
  }, []);

  const onDelete = async (id) => {
    try {
      await deleteNotificationById(id);
      await loadNotifications();
    } catch (e) {
      setError(e.message || 'Failed to delete notification');
    }
  };

  const onSend = async (e) => {
    e.preventDefault();
    setStatus('');
    setError('');
    try {
      await sendNotificationToUser({ title, userId: recipientId, body });
      setStatus('Notification sent successfully.');
      setTitle('');
      setBody('');
      setRecipientId('');
    } catch (e2) {
      setError(e2.message || 'Failed to send notification');
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <div className="mh-container py-8 md:py-12">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-200 to-cyan-200 mb-8">
          Notifications
        </h1>
        {error && <p className="text-red-300 mb-4">{error}</p>}
        {status && <p className="text-emerald-300 mb-4">{status}</p>}

        <form onSubmit={onSend} className="mh-card p-6 space-y-4 mb-8">
          <h2 className="font-semibold text-white">Send notification</h2>
          <div>
            <label className="text-sm text-slate-300 block mb-2">Recipient</label>
            <select value={recipientId} onChange={(e) => setRecipientId(e.target.value)} className="mh-input" required>
              <option value="">Select recipient</option>
              {recipients.map((r) => (
                <option key={`${r.accountType}-${r._id}`} value={r._id}>
                  [{r.accountType}] {r.name} ({r.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-300 block mb-2">Title</label>
            <input className="mh-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm text-slate-300 block mb-2">Message</label>
            <textarea className="mh-input min-h-[110px]" value={body} onChange={(e) => setBody(e.target.value)} required />
          </div>
          <button type="submit" className="mh-btn-primary">Send Notification</button>
        </form>

        {notifications.length === 0 ? (
          <div className="mh-card px-6 py-10 text-slate-400 text-center">No notifications available.</div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n._id} className="mh-card px-5 py-4">
                <h3 className="font-semibold text-white">{n.title}</h3>
                <p className="text-slate-300 mt-1">{n.body}</p>
                <p className="text-xs text-slate-400 mt-2">
                  From: {n.senderName || 'System'}
                  {n.senderEmail ? ` (${n.senderEmail})` : ''}
                  {' '}[{n.senderRole || 'System'}]
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-500">{new Date(n.createdAt || n.date).toLocaleString()}</span>
                  <button onClick={() => onDelete(n._id)} className="mh-btn-danger text-xs px-3 py-1">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserNotifications;
