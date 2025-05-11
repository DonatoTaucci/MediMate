
"use client";

import type { TodaysMedicationItem, Medication, DailyIntake } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Clock, Edit3, Pill, Trash2, AlarmClockOff } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface MedicationCardProps {
  medicationItem: TodaysMedicationItem;
  onMarkAsTaken: (medicationId: string, date: string, scheduledTime: string) => void;
  onUnmarkAsTaken: (medicationId: string, date: string, scheduledTime: string) => void;
  onReschedule: (medication: Medication, intake: DailyIntake, scheduledTime: string) => void;
  onDelete: (medicationId: string) => void;
}

export function MedicationCard({ medicationItem, onMarkAsTaken, onUnmarkAsTaken, onReschedule, onDelete }: MedicationCardProps) {
  const { medication, intake, scheduledTime, isTaken, isRescheduled, date: itemDateStr } = medicationItem;
  
  const handleToggleTaken = () => {
    if (isTaken) {
      onUnmarkAsTaken(medication.id, itemDateStr, scheduledTime);
    } else {
      onMarkAsTaken(medication.id, itemDateStr, scheduledTime);
    }
  };
  
  const actualCurrentDateStr = format(new Date(), 'yyyy-MM-dd');
  const isDisplayingToday = itemDateStr === actualCurrentDateStr;
  
  // Past due logic: only relevant if displaying today's medications and it's not yet taken
  // and the scheduled time for today has passed.
  let isPastDue = false;
  if (isDisplayingToday && !isTaken) {
    const now = new Date();
    const scheduledDateTime = new Date(`${itemDateStr}T${intake.time}`);
    if (now > scheduledDateTime) {
      isPastDue = true;
    }
  }

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
             <div 
                className="w-5 h-5 rounded-full shrink-0 border" 
                style={{ backgroundColor: medication.color }}
                aria-label={`Color indicator ${medication.color}`}
              />
            <CardTitle className="text-xl">{medication.name}</CardTitle>
          </div>
          <div className="flex items-center space-x-1">
            <Link href={`/edit-medication/${medication.id}`} passHref>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                <Edit3 className="h-4 w-4" />
                <span className="sr-only">Edit Medication</span>
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(medication.id)}>
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete Medication</span>
            </Button>
          </div>
        </div>
        <CardDescription className="flex items-center text-sm pt-1">
          <Pill className="mr-2 h-4 w-4 text-muted-foreground" />
          {intake.dosage} {intake.unit === 'custom' && intake.customUnit ? intake.customUnit : intake.unit}{intake.dosage > 1 && intake.unit !== "ml" && intake.unit !== "mg" && intake.unit !== "g" ? (intake.unit === "patch" ? "es" : "s") : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pb-4">
        <div className="flex items-center text-base">
          <Clock className="mr-2 h-5 w-5 text-primary" />
          Scheduled for: <span className="font-semibold ml-1">{intake.time}</span>
          {isRescheduled && <span className="ml-2 text-xs text-accent bg-accent/20 px-1.5 py-0.5 rounded-full">Rescheduled</span>}
        </div>
        {medication.notes && (
            <p className="mt-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded-md border border-dashed">
                <strong>Notes:</strong> {medication.notes}
            </p>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="w-full flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-2">
          <Button
            onClick={handleToggleTaken}
            variant={isTaken ? "secondary" : "default"}
            className="w-full flex-1 min-w-[150px] sm:flex-auto"
            aria-pressed={isTaken}
          >
            {isTaken ? (
              <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
            ) : (
              <Circle className="mr-2 h-5 w-5" />
            )}
            {isTaken ? 'Mark as Not Taken' : 'Mark as Taken'}
          </Button>
          {isDisplayingToday && isPastDue && !isTaken && ( 
             <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onReschedule(medication, intake, scheduledTime)}
                className="w-full flex-1 min-w-[150px] sm:flex-auto text-accent border-accent hover:bg-accent/10 hover:text-accent-foreground"
            >
              <AlarmClockOff className="mr-2 h-4 w-4" />
              Snooze / Reschedule
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}


