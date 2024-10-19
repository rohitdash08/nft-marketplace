'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import GoogleLogin from '../../components/GoogleLogin';
import GithubLogin from '../../components/GithubLogin';
import AppleLogin from '../../components/AppleLogin'

export default function LoginPage() {
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <div className="space-y-4">
          <GoogleLogin  />
          <GithubLogin  />
          <AppleLogin/>
        </div>
      </div>
    </div>
  );
}