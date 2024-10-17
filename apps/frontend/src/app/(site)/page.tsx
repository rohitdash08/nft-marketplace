import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Welcome to NFT Marketplace</h1>
      <p className="text-xl mb-8">
        Discover, create, and trade unique digital assets on the Solana blockchain.
      </p>
      <div className="space-x-4">
        <Link href="/marketplace" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Explore Marketplace
        </Link>
        <Link href="/create" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Create NFT
        </Link>
      </div>
    </div>
  );
}