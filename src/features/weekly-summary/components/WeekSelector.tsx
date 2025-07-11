import React from 'react';
import { endOfWeek, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

interface WeekSelectorProps {
  currentWeekStart: Date;
  weekSummary: any;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

const WeekSelector: React.FC<WeekSelectorProps> = ({
  currentWeekStart,
  weekSummary,
  onPreviousWeek,
  onNextWeek,
}) => {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="text-lg">
            Semana del {format(currentWeekStart, "dd/MM/yyyy", { locale: es })} al {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), "dd/MM/yyyy", { locale: es })}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {format(currentWeekStart, "MMMM yyyy", { locale: es })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreviousWeek}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNextWeek}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};

export default WeekSelector;