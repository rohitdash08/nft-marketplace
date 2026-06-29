"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout, updateProfile, error, clearError } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    lastName: "",
    username: "",
    bio: "",
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        lastName: user.lastName || "",
        username: user.username || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setUpdateSuccess(false);
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await updateProfile(form);
      setUpdateSuccess(true);
      setIsEditing(false);
    } catch {
      // Error handled by auth context
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">Profile</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {(user.name?.[0] || user.email[0]).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {user.name} {user.lastName}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username || "username"}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 capitalize">
                  {user.providerName.toLowerCase()} account
                </p>
              </div>

              <div className="mt-6 space-y-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {isEditing ? "Cancel Edit" : "Edit Profile"}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full py-2 px-4 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Account Information
              </h3>

              {updateSuccess && (
                <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-green-700 dark:text-green-300 text-sm">
                  Profile updated successfully!
                </div>
              )}

              {error && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-700 dark:text-red-300 text-sm">
                  {error}
                </div>
              )}

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        First Name
                      </label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Last Name
                      </label>
                      <input
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Username
                    </label>
                    <input
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={form.bio}
                      onChange={handleChange}
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">First Name</p>
                      <p className="text-gray-900 dark:text-white">{user.name || "Not set"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Last Name</p>
                      <p className="text-gray-900 dark:text-white">{user.lastName || "Not set"}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-gray-900 dark:text-white">{user.email}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Username</p>
                    <p className="text-gray-900 dark:text-white">@{user.username || "Not set"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Bio</p>
                    <p className="text-gray-900 dark:text-white">{user.bio || "No bio yet"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Wallet</p>
                    <p className="text-gray-900 dark:text-white font-mono text-sm">
                      {user.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : "Not connected"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
