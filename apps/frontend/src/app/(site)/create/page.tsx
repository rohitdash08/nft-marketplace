'use client';

import { useState } from 'react';
import { useAuthFetch } from '../../../utlis/authFetch';
import ErrorMessage from '../../components/ErrorMessage';

export default function CreateNFTPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const authFetch = useAuthFetch();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('price', formData.price);
    if (file) {
      formDataToSend.append('image', file);
    }

    try {
      const response = await authFetch('/api/nfts/create', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to create NFT');
      }

      setSuccessMessage('NFT created successfully!');
      setFormData({ name: '', description: '', price: '' });
      setFile(null);
    } catch (error) {
      console.error('Error creating NFT:', error);
      setError('Failed to create NFT. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Create NFT</h1>
      <form onSubmit={handleSubmit} className="max-w-md">
        <div className="mb-4">
          <label htmlFor="name" className="block mb-2">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block mb-2">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="price" className="block mb-2">Price (SOL)</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
            min="0"
            step="0.01"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="image" className="block mb-2">Image</label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
            required
            accept="image/*"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create NFT'}
        </button>
      </form>
      {error && <ErrorMessage message={error} />}
      {successMessage && (
        <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {successMessage}
        </div>
      )}
    </div>
  );
}