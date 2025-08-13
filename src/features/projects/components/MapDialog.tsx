import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Map as MapIcon } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapDialogProps {
  projectName: string;
  latitude: number;
  longitude: number;
  address?: string;
}

export const MapDialog: React.FC<MapDialogProps> = ({ 
  projectName, 
  latitude, 
  longitude, 
  address 
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          size="sm" 
          className="h-8"
        >
          <MapIcon className="h-3 w-3 mr-1" />
          View map
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>{projectName}</DialogTitle>
          {address && (
            <p className="text-sm text-muted-foreground">{address}</p>
          )}
        </DialogHeader>
        <div className="h-96 w-full rounded-lg overflow-hidden">
          <MapContainer
            center={[latitude, longitude]}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            className="rounded-lg"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[latitude, longitude]}>
              <Popup>
                <div className="text-center">
                  <strong>{projectName}</strong>
                  {address && <div className="text-sm mt-1">{address}</div>}
                  <div className="text-xs text-muted-foreground mt-1">
                    {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  </div>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </DialogContent>
    </Dialog>
  );
};