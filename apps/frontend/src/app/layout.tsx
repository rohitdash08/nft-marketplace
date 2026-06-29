import { AuthProvider } from "./hooks/useAuth";
import "./global.css";

export const metadata = {
  title: "NFT Marketplace",
  description: "Buy, sell, and discover NFTs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
