// src/pages/AdminSettings.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function AdminSettings() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatar: null,
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("http://localhost:4500/api/admin/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        setProfile((prev) => ({
          ...prev,
          name: data.name || "",
          email: data.email || "",
        }));
      } catch (err) {
        console.error("Error fetching profile", err);
      }
    }
    fetchProfile();
  }, []);

  function handleThemeChange() {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  }

  async function handleProfileSave(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", profile.name);
      formData.append("email", profile.email);
      if (profile.avatar) {
        formData.append("avatar", profile.avatar);
      }
      await fetch("http://localhost:4500/api/admin/update-profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });
      alert("Profile updated successfully!");
    } catch {
      alert("Error updating profile");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("New passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await fetch("http://localhost:4500/api/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(passwords),
      });
      alert("Password changed successfully!");
    } catch {
      alert("Error changing password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 space-y-8">
      <motion.h1
        className="text-3xl font-bold text-green-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        Settings
      </motion.h1>

      {/* Profile Settings */}
      <motion.form
        onSubmit={handleProfileSave}
        className="bg-white p-6 rounded-xl shadow space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-semibold text-gray-700">Profile</h2>
        <input
          type="text"
          placeholder="Name"
          className="w-full border rounded p-2"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded p-2"
          value={profile.email}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setProfile({ ...profile, avatar: e.target.files[0] })}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </motion.form>

      {/* Password Settings */}
      <motion.form
        onSubmit={handlePasswordChange}
        className="bg-white p-6 rounded-xl shadow space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-semibold text-gray-700">Change Password</h2>
        <input
          type="password"
          placeholder="Current Password"
          className="w-full border rounded p-2"
          value={passwords.currentPassword}
          onChange={(e) =>
            setPasswords({ ...passwords, currentPassword: e.target.value })
          }
        />
        <input
          type="password"
          placeholder="New Password"
          className="w-full border rounded p-2"
          value={passwords.newPassword}
          onChange={(e) =>
            setPasswords({ ...passwords, newPassword: e.target.value })
          }
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          className="w-full border rounded p-2"
          value={passwords.confirmPassword}
          onChange={(e) =>
            setPasswords({ ...passwords, confirmPassword: e.target.value })
          }
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Changing..." : "Change Password"}
        </button>
      </motion.form>

      {/* Theme Toggle */}
      <motion.div
        className="bg-white p-6 rounded-xl shadow flex justify-between items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-semibold text-gray-700">Theme</h2>
        <button
          onClick={handleThemeChange}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          {theme === "light" ? "Switch to Dark" : "Switch to Light"}
        </button>
      </motion.div>
    </div>
  );
}
