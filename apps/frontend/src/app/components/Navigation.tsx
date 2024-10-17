'use client';

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function Navigation() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          NFT Marketplace
        </Link>
        <div className="space-x-4">
          <Link href="/marketplace" className="hover:text-gray-300">
            Marketplace
          </Link>
          {user ? (
            <>
              <Link href="/create" className="hover:text-gray-300">
                Create NFT
              </Link>
              <Link href="/dashboard" className="hover:text-gray-300">
                Dashboard
              </Link>
              <button onClick={logout} className="hover:text-gray-300">
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="hover:text-gray-300">
            Login
          </Link>
        )}
      </div>
    </div>
  </nav>
);
}