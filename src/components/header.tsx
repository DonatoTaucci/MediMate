
import Link from 'next/link';
import { Pill } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Pill className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-primary">MediMate</span>
        </Link>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

