import AuthForm from '@/components/AuthForm';

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-mono flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-lime-400 mb-1">FLOORTASY</h1>
        <p className="text-xs text-zinc-400 mb-8">Fantasy Floorbalová Liga</p>
        <AuthForm />
      </div>
    </div>
  );
}
