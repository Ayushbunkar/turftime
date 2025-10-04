import React, { useState } from 'react';
import axios from 'axios';

const ChangeAdminPassword = ({ onClose }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/admin/change-password', { oldPassword, newPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Password change failed');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Change Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" placeholder="Old Password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="w-full p-2 border rounded" required />
          <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-2 border rounded" required />
          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">Change Password</button>
        </form>
        {message && <p className="mt-4 text-center text-red-600">{message}</p>}
        <button onClick={onClose} className="mt-4 w-full bg-gray-300 py-2 rounded">Close</button>
      </div>
    </div>
  );
};

export default ChangeAdminPassword;
