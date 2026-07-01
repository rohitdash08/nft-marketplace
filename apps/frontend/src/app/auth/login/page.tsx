const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const providers = [
  {
    id: "google",
    label: "Continue with Google",
    className:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
  },
  {
    id: "github",
    label: "Continue with GitHub",
    className: "border border-gray-800 bg-[#24292e] text-white hover:bg-[#1b1f23]",
  },
  {
    id: "apple",
    label: "Continue with Apple",
    className: "border border-gray-900 bg-black text-white hover:bg-gray-800",
  },
] as const;

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-gray-900">NFT Marketplace</h1>
        <p className="mt-2 text-sm text-gray-500">
          Sign in with Google, GitHub, or Apple — no Clerk or NextAuth.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          {providers.map((p) => (
            <a
              key={p.id}
              href={`${API_URL}/auth/${p.id}`}
              className={`flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-medium shadow-sm transition ${p.className}`}
            >
              {p.label}
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
