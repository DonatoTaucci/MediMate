
"use client";

import Link from 'next/link';
import { PlusCircle, ListChecks, Loader2, ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMedications, getMedicationsForDate } from '@/hooks/use-medications';
import { MedicationCard } from '@/components/medication-card';
import { useEffect, useState, useMemo } from 'react';
import type { Medication, DailyIntake, TodaysMedicationItem } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useNotificationScheduler } from '@/hooks/useNotificationScheduler';

export default function DashboardPage() {
  const {
    medications,
    takenLog,
    tempReschedules,
    isLoading,
    markAsTaken,
    unmarkAsTaken,
    deleteMedication,
    addTemporaryReschedule,
  } = useMedications();
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDateDisplay, setSelectedDateDisplay] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [medicationToDelete, setMedicationToDelete] = useState<string | null>(null);

  useEffect(() => {
    setSelectedDateDisplay(format(selectedDate, 'PPPP', { locale: enUS }));
  }, [selectedDate]);

  const displayedMedications = useMemo(() => {
    if (isLoading) return [];
    return getMedicationsForDate(medications, takenLog, tempReschedules, selectedDate);
  }, [medications, takenLog, tempReschedules, selectedDate, isLoading]);

  // Get medications specifically for *today* to pass to the notification scheduler
  const todaysActualMedications = useMemo(() => {
    if (isLoading) return [];
    // Ensure we are always using the actual current date for notifications, regardless of selectedDate for display
    return getMedicationsForDate(medications, takenLog, tempReschedules, new Date());
  }, [medications, takenLog, tempReschedules, isLoading]);

  // Initialize notification scheduler
  useNotificationScheduler(todaysActualMedications, takenLog);


  const handleDeleteClick = (medId: string) => {
    setMedicationToDelete(medId);
    setShowDeleteAlert(true);
  };

  const confirmDelete = () => {
    if (medicationToDelete) {
      const medName = medications.find(m => m.id === medicationToDelete)?.name || "Medication";
      deleteMedication(medicationToDelete);
      toast({
        title: "Medication Deleted",
        description: `${medName} has been removed.`,
      });
      setMedicationToDelete(null);
    }
    setShowDeleteAlert(false);
  };

  const handleReschedule = (medication: Medication, intake: DailyIntake, scheduledTime: string) => {
    const currentActualDate = new Date();
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    
    if (format(currentActualDate, 'yyyy-MM-dd') !== selectedDateStr) {
      toast({
        title: "Reschedule Info",
        description: "Rescheduling is only available for the current day's view.",
        variant: "default"
      });
      return;
    }

    const newTime = prompt("Enter new time for today (HH:MM):", intake.time);
    if (newTime && /^[0-2][0-9]:[0-5][0-9]$/.test(newTime)) {
        addTemporaryReschedule({
            medicationId: medication.id,
            originalDate: selectedDateStr, 
            originalTime: scheduledTime, // This should be intake.originalTime or equivalent passed to MedicationCard
            newTime: newTime,
        });
        toast({
            title: "Medication Rescheduled",
            description: `${medication.name} intake at ${scheduledTime} has been rescheduled to ${newTime} for today.`,
        });
    } else if (newTime !== null) { 
        toast({
            title: "Invalid Time",
            description: "Please enter time in HH:MM format.",
            variant: "destructive"
        });
    }
  };

  const handlePreviousDay = () => {
    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };

  const handleNextDay = () => {
    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };
  
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setIsCalendarOpen(false);
    }
  };

  return (
    <div className="container py-8 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medication Dashboard</h1>
          <p className="text-muted-foreground">
            Viewing schedule for {selectedDateDisplay}.
          </p>
        </div>
        <Link href="/add-medication" passHref>
          <Button size="lg" className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Medication
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
        <Button variant="outline" size="icon" onClick={handlePreviousDay} aria-label="Previous day">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full min-w-[230px] max-w-xs sm:w-72 text-base sm:text-lg justify-center"
            >
              <CalendarIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              {format(selectedDate, "PPP", { locale: enUS })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              initialFocus
              locale={enUS}
              disabled={(date) =>
                date > new Date(new Date().setDate(new Date().getDate() + 365)) || 
                date < new Date(new Date().setDate(new Date().getDate() - 365))
              }
            />
          </PopoverContent>
        </Popover>
        <Button variant="outline" size="icon" onClick={handleNextDay} aria-label="Next day">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {isLoading ? (
         <div className="flex justify-center items-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
         </div>
      ) : displayedMedications.length === 0 ? (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ListChecks className="mr-2 h-6 w-6 text-primary" />
              No Medications Scheduled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              There are no medications scheduled for {selectedDateDisplay}.
            </p>
            {medications.length === 0 && (
                <Link href="/add-medication" passHref>
                <Button variant="secondary">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Your First Medication
                </Button>
                </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayedMedications.map((medItem: TodaysMedicationItem) => (
            <MedicationCard
              key={`${medItem.medication.id}-${medItem.scheduledTime}-${medItem.date}`}
              medicationItem={medItem}
              onMarkAsTaken={markAsTaken}
              onUnmarkAsTaken={unmarkAsTaken}
              onReschedule={handleReschedule}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              medication "{medications.find(m => m.id === medicationToDelete)?.name || ''}" and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMedicationToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

