import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-app flex flex-col items-center justify-center gap-4 py-24 text-center">
      <h1 className="text-4xl font-extrabold text-ink-900">404</h1>
      <p className="text-ink-500">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/" className="btn-primary">Back to Home</Link>
    </div>
  );
}
