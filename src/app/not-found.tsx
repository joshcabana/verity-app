import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center space-y-6">
        <h1 className="font-serif text-6xl gold-gradient-text">404</h1>
        <p className="text-muted text-sm">This page doesn't exist.</p>
        <Link href="/" className="ghost-pill inline-block">
          Go home
        </Link>
      </div>
    </div>
  );
}
