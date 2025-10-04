import React, { useState } from 'react';
import axios from 'axios';

const TurfAdminRegister = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    turfName: '',
    phoneNumber: '',
    secretKey: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axios.post('/api/admin/register', form);
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Turf Admin Registration</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="turfName" placeholder="Turf Name" value={form.turfName} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="phoneNumber" placeholder="Phone Number" value={form.phoneNumber} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="secretKey" placeholder="Secret Key" value={form.secretKey} onChange={handleChange} className="w-full p-2 border rounded" required />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Register</button>
      </form>
      {message && <p className="mt-4 text-center text-red-600">{message}</p>}
    </div>
  );
};

export default TurfAdminRegister;
