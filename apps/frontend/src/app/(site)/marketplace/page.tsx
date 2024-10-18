'use client';

import { useState, useEffect } from 'react';
import { useAuthFetch } from '../../../utlis/authFetch';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
}

export default function MarketplacePage() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authFetch = useAuthFetch();

  useEffect(() => {
    fetchNFTs();
  }, []);

  const fetchNFTs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authFetch('/api/nfts');
      if (!response.ok) {
        throw new Error('Failed to fetch NFTs');
      }
      const data = await response.json();
      setNfts(data);
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
      <h1 className="text-3xl font-bold mb-6">NFT Marketplace</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nfts.map((nft) => (
          <div key={nft.id} className="border rounded-lg p-4 shadow-md">
            <img src={nft.image} alt={nft.name} className="w-full h-48 object-cover mb-4 rounded" />
            <h2 className="text-xl font-semibold mb-2">{nft.name}</h2>
            <p className="text-gray-600 mb-4">{nft.description}</p>
            <p className="text-lg font-bold">Price: {nft.price} SOL</p>
            <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Buy Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}