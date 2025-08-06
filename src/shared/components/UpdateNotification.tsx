import React from 'react';
import { RefreshCw, X } from 'lucide-react';
import { useUpdateNotification } from '@/shared/hooks/useUpdateNotification';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

export const UpdateNotification: React.FC = () => {
  const { needRefresh, updateServiceWorker, close } = useUpdateNotification();

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-blue-900">
              Nueva versión disponible
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={close}
              className="h-6 w-6 p-0 text-blue-700 hover:bg-blue-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-xs text-blue-700">
            Hay actualizaciones disponibles para la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button
            onClick={() => updateServiceWorker(true)}
            size="sm"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className="h-3 w-3 mr-2" />
            Actualizar ahora
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};