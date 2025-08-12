import React from 'react';
import { Clock, Users, Building, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

interface SummaryCardProps {
  weekSummary: any;
  weekEntries: any[];
  showEmployeeCount?: boolean;
  showProjectCount?: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  weekSummary,
  weekEntries,
  showEmployeeCount = true,
  showProjectCount = true,
}) => {
  const daysWorked = weekSummary?.dailySummary.filter((d: any) => d.entries.length > 0).length || 0;
  const uniqueProjects = [...new Set(weekEntries.map((e) => e.projectId))].filter(Boolean).length;
  const uniqueEmployees = [...new Set(weekEntries.map((e) => e.userId))].length;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Total Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Hours Worked</span>
            </div>
            <div className="text-2xl font-bold">{weekSummary?.formattedTotal || '0:00'}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Days Recorded</span>
            </div>
            <div className="text-2xl font-bold">{daysWorked}</div>
          </div>

          {showProjectCount && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Projects</span>
              </div>
              <div className="text-2xl font-bold">{uniqueProjects}</div>
            </div>
          )}

          {showEmployeeCount && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Employees</span>
              </div>
              <div className="text-2xl font-bold">{uniqueEmployees}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;