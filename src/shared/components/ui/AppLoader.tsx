import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface AppLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function AppLoader({ 
  size = 'lg', 
  text = 'Cargando...', 
  className 
}: AppLoaderProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  };

  return (
    <div className={cn(
      "flex min-h-screen flex-col items-center justify-center space-y-4",
      className
    )}>
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className={cn(
          "animate-spin text-primary",
          sizeClasses[size]
        )} />
        <div className="text-center">
          <p className="text-lg font-medium text-foreground">{text}</p>
          <p className="text-sm text-muted-foreground">
            Por favor espera un momento
          </p>
        </div>
      </div>
      
      {/* Progress dots animation */}
      <div className="flex space-x-1">
        <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
        <div className="h-2 w-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="h-2 w-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
}