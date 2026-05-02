import React, { useState } from 'react';
import { getAllUsers } from '../../../services/admin/UsersManagement';
import { getAllSeller } from '../../../services/seller/SellerManagement';
import { sendNotificationToUser } from '../../../services/user/notifications/NotificationsService';

function AdminNotifications() {
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState('');

  const loadUsers = async () => {
    try {
      setStatus('');
      const [usersResult, sellersResult] = await Promise.allSettled([
        getAllUsers(),
        getAllSeller(),
      ]);

      const usersData = usersResult.status === 'fulfilled' && Array.isArray(usersResult.value)
        ? usersResult.value.map((u) => ({ ...u, accountType: 'User' }))
        : [];

      const sellersData = sellersResult.status === 'fulfilled' && Array.isArray(sellersResult.value)
        ? sellersResult.value.map((s) => ({ ...s, accountType: 'Seller' }))
        : [];

      const combined = [...usersData, ...sellersData];
      setUsers(combined);
      if (!combined.length) {
        setStatus('No users or sellers found.');
      }
    } catch (error) {
      setUsers([]);
      setStatus(error?.message || 'Failed to load users and sellers.');
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setStatus('');
    try {
      await sendNotificationToUser({ title, body, userId });
      setStatus('Notification sent successfully.');
      setTitle('');
      setBody('');
    } catch (error) {
      setStatus(error?.message || 'Failed to send notification.');
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <div className="mh-container py-8 md:py-12">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-200 to-cyan-200 mb-8">
          Notification Center
        </h1>
        <button onClick={loadUsers} className="mh-btn-secondary mb-4">Load Users & Sellers</button>
        <form onSubmit={submit} className="mh-card p-6 space-y-4 max-w-2xl">
          <div>
            <label className="text-sm text-slate-300 block mb-2">Recipient</label>
            <select value={userId} onChange={(e) => setUserId(e.target.value)} className="mh-input" required>
              <option value="">Select user</option>
              {users.map((u) => (
                <option key={`${u.accountType}-${u._id}`} value={u._id}>
                  [{u.accountType}] {u.name} ({u.email})
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
          {status && <p className="text-emerald-300">{status}</p>}
        </form>
      </div>
    </div>
  );
}

export default AdminNotifications;
