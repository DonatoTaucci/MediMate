
import { Header } from '@/components/header';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col items-center">
        {children}
      </main>
      <footer className="py-6 md:px-8 md:py-0 bg-background border-t">
        <div className="container mx-auto flex flex-col items-center justify-center gap-4 md:h-20 md:flex-row">
          <p className="text-sm leading-loose text-center text-muted-foreground">
            MediMate &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </>
  );
}

