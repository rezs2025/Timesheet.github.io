import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Clock, Calendar, Building, ArrowRight } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { AppLoader } from '@/shared/components/ui/AppLoader';
import { useAuth } from '@/shared/hooks/useAuth';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { loading: loadingUser, user, error: errorUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [todayEntry, setTodayEntry] = useState(null);
  const [weekSummary, setWeekSummary] = useState({
    totalHours: 25,
    totalDays: 5,
    entries: [
      {
        id: 'myrandom',
        checkInTime: new Date(),
        checkOutTime: new Date(),
        date: new Date(),
      }
    ]
  });

  if (loadingUser) {
    return <AppLoader text="Cargando dashboard..." />;
  }

  if (errorUser || !user) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>{errorUser || 'Error de autenticación'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido, {user.fullName || user.email}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Estado de Hoy
            </CardTitle>
            <CardDescription>
              {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayEntry ? (
              <>
                <div className="space-y-2">
                  <p><strong>Proyecto:</strong> projectName</p>
                  <p><strong>Entrada:</strong> {'No registrada'}</p>
                  <p><strong>Salida:</strong> {'No registrada'}</p>
                  
                    <p><strong>Horas trabajadas:</strong>
                      5.20
                     hrs</p>
                </div>
                <Button
                  onClick={() => navigate('/time-entry')}
                  className="w-full"
                >
                   'Ver Detalles'
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </>
            ) : (
              <>
                <p className="text-muted-foreground">No has registrado horas hoy.</p>
                <Button 
                  onClick={() => navigate('/time-entry')}
                  className="w-full"
                >
                  Registrar Horas
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Week Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Resumen Semanal
            </CardTitle>
            <CardDescription>
              Semana del {format(startOfWeek(new Date(), { weekStartsOn: 1 }), "d 'de' MMMM", { locale: es })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {weekSummary ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{weekSummary.totalHours}</div>
                    <div className="text-sm text-muted-foreground">Horas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{weekSummary.totalDays}</div>
                    <div className="text-sm text-muted-foreground">Días</div>
                  </div>
                </div>
                
                {weekSummary.entries.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Últimas entradas:</p>
                    {weekSummary.entries.slice(0, 3).map((entry, index) => (
                      <div key={entry.id} className="flex justify-between text-sm">
                        <span>{format(new Date(entry.date), "EEEE d", { locale: es })}</span>
                        <Badge variant="outline">
                          {entry.checkInTime && entry.checkOutTime ? 
                            `${22} hrs` :
                            'Pendiente'
                          }
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/weekly-summary')}
                  className="w-full"
                >
                  Ver Reporte Completo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">Cargando resumen semanal...</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Project Info */}
      
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Mis Proyectos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h3 className="font-semibold">Casa de pepeto</h3>
              <p className="text-muted-foreground">
                'Sin descripción'
              </p>
              {user.role === 'admin' && (
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/projects')}
                  className="mt-4"
                >
                  Ver Todos los Proyectos
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
    </div>
  );
};

export default UserDashboard;