import './global.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../app/contexts/AuthContext';
import Navigation from '../app/components/Navigation';
import Footer from '../app/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'NFT Marketplace',
  description: 'A decentralized marketplace for NFTs on Solana',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}