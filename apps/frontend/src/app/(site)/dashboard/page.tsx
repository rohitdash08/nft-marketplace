'use client';

import { useState, useEffect } from 'react';
import { useAuthFetch } from '../../../utlis/authFetch';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  owner: string;
}

export default function DashboardPage() {
  const [ownedNFTs, setOwnedNFTs] = useState<NFT[]>([]);
  const [createdNFTs, setCreatedNFTs] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authFetch = useAuthFetch();
  const { user } = useAuth();

  useEffect(() => {
    fetchNFTs();
  }, []);

  const fetchNFTs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [ownedResponse, createdResponse] = await Promise.all([
        authFetch('/api/nfts/owned'),
        authFetch('/api/nfts/created'),
      ]);

      if (!ownedResponse.ok || !createdResponse.ok) {
        throw new Error('Failed to fetch NFTs');
      }

      const ownedData = await ownedResponse.json();
      const createdData = await createdResponse.json();

      setOwnedNFTs(ownedData);
      setCreatedNFTs(createdData);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      setError('Failed to fetch NFTs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your NFTs</h2>
        {ownedNFTs.length === 0 ? (
          <p>You don't own any NFTs yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ownedNFTs.map((nft) => (
              <div key={nft.id} className="border rounded-lg p-4 shadow-md">
                <img src={nft.image} alt={nft.name} className="w-full h-48 object-cover mb-4 rounded" />
                <h3 className="text-xl font-semibold mb-2">{nft.name}</h3>
                <p className="text-gray-600 mb-4">{nft.description}</p>
                <p className="text-lg font-bold">Price: {nft.price} SOL</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-4">Created NFTs</h2>
        {createdNFTs.length === 0 ? (
          <p>You haven't created any NFTs yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {createdNFTs.map((nft) => (
              <div key={nft.id} className="border rounded-lg p-4 shadow-md">
                <img src={nft.image} alt={nft.name} className="w-full h-48 object-cover mb-4 rounded" />
                <h3 className="text-xl font-semibold mb-2">{nft.name}</h3>
                <p className="text-gray-600 mb-4">{nft.description}</p>
                <p className="text-lg font-bold">Price: {nft.price} SOL</p>
                <p className="text-sm text-gray-500">Owner: {nft.owner === user?.id ? 'You' : nft.owner}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
    