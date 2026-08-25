import { AlertCircle } from 'lucide-react';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="w-full flex-1 flex items-center justify-center bg-background min-h-[70vh]">
      <div className="text-center p-8 border border-white/10 bg-card max-w-md">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-6" />
        <h1 className="text-4xl font-display font-bold text-white mb-4 uppercase tracking-wider">
          404 Not Found
        </h1>
        <p className="text-muted-foreground mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link 
          href="/" 
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 font-display font-bold tracking-wider transition-colors inline-block"
        >
          RETURN TO HOME
        </Link>
      </div>
    </div>
  );
}
