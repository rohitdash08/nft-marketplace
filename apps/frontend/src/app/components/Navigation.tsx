'use client';

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function Navigation() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-800 text-white ">
      <div className="container mx-auto grid grid-cols-3 justify-between items-center">
        <Link href="/" className="text-xl pt-1 font-bold flex items-center justify-start">
          NFT Marketplace
        </Link>
        <div className="space-x-4 flex items-center justify-between">
          {user ? (
            <>
              <button onClick={logout} className="bg-blue-400 hover:text-gray-300">
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