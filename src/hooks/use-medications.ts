
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Medication, MedicationTakenLog, TemporaryReschedule, DailyIntake, TodaysMedicationItem } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { format, differenceInCalendarDays } from 'date-fns';

const MEDICATION_STORAGE_KEY = 'medications';
const MEDICATION_TAKEN_LOG_KEY = 'medicationTakenLog';
const TEMP_RESCHEDULE_KEY = 'tempReschedules';
const LAST_RESET_DATE_KEY = 'lastResetDate';

export function useMedications() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [takenLog, setTakenLog] = useState<MedicationTakenLog>({});
  const [tempReschedules, setTempReschedules] = useState<TemporaryReschedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastResetDate, setLastResetDate] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    try {
      const storedMedications = localStorage.getItem(MEDICATION_STORAGE_KEY);
      if (storedMedications) {
        setMedications(JSON.parse(storedMedications));
      }
      const storedTakenLog = localStorage.getItem(MEDICATION_TAKEN_LOG_KEY);
      if (storedTakenLog) {
        setTakenLog(JSON.parse(storedTakenLog));
      }
      const storedTempReschedules = localStorage.getItem(TEMP_RESCHEDULE_KEY);
      if (storedTempReschedules) {
        setTempReschedules(JSON.parse(storedTempReschedules));
      }
      const storedLastResetDate = localStorage.getItem(LAST_RESET_DATE_KEY);
      setLastResetDate(storedLastResetDate);

    } catch (error) {
      console.error("Failed to load data from localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) { 
      localStorage.setItem(MEDICATION_STORAGE_KEY, JSON.stringify(medications));
    }
  }, [medications, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(MEDICATION_TAKEN_LOG_KEY, JSON.stringify(takenLog));
    }
  }, [takenLog, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(TEMP_RESCHEDULE_KEY, JSON.stringify(tempReschedules));
    }
  }, [tempReschedules, isLoading]);
  
  useEffect(() => {
    if (!isLoading && lastResetDate) {
      localStorage.setItem(LAST_RESET_DATE_KEY, lastResetDate);
    }
  }, [lastResetDate, isLoading]);

  useEffect(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    if (lastResetDate !== todayStr) {
      console.log("Performing daily reset...");
      const updatedTempReschedules = tempReschedules.filter(r => r.appliedDate === todayStr);
      setTempReschedules(updatedTempReschedules);
      setLastResetDate(todayStr);
    }
  }, [lastResetDate, tempReschedules]);


  const addMedication = useCallback((medicationData: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMedication: Medication = {
      ...medicationData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMedications(prev => [...prev, newMedication]);
  }, []);

  const updateMedication = useCallback((id: string, medicationData: Partial<Omit<Medication, 'id' | 'createdAt'>>) => {
    setMedications(prev => 
      prev.map(med => 
        med.id === id ? { ...med, ...medicationData, updatedAt: new Date().toISOString() } : med
      )
    );
  }, []);

  const deleteMedication = useCallback((id: string) => {
    setMedications(prev => prev.filter(med => med.id !== id));
    setTakenLog(prevLog => {
      const newLog = {...prevLog};
      delete newLog[id];
      return newLog;
    });
    setTempReschedules(prevReschedules => prevReschedules.filter(r => r.medicationId !== id));
  }, []);

  const markAsTaken = useCallback((medicationId: string, date: string, scheduledTime: string, actualTakenTime?: string) => {
    setTakenLog(prev => {
      const newLog = JSON.parse(JSON.stringify(prev)); 
      if (!newLog[medicationId]) newLog[medicationId] = {};
      if (!newLog[medicationId][date]) newLog[medicationId][date] = {};
      newLog[medicationId][date][scheduledTime] = {
        taken: true,
        actualTakenTime: actualTakenTime || format(new Date(), 'HH:mm'),
      };
      return newLog;
    });
  }, []);

  const unmarkAsTaken = useCallback((medicationId: string, date: string, scheduledTime: string) => {
    setTakenLog(prev => {
      const newLog = JSON.parse(JSON.stringify(prev)); 
      if (newLog[medicationId]?.[date]?.[scheduledTime]) {
        newLog[medicationId][date][scheduledTime].taken = false;
        delete newLog[medicationId][date][scheduledTime].actualTakenTime;
      }
      return newLog;
    });
  }, []);
  
  const getTakenStatus = useCallback((medicationId: string, date: string, scheduledTime: string): boolean => {
    return takenLog[medicationId]?.[date]?.[scheduledTime]?.taken || false;
  }, [takenLog]);

  const addTemporaryReschedule = useCallback((rescheduleData: Omit<TemporaryReschedule, 'appliedDate'>) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const newReschedule: TemporaryReschedule = {
      ...rescheduleData,
      appliedDate: todayStr, // The reschedule is applied/created today
    };
    setTempReschedules(prev => [...prev.filter(r => !(r.medicationId === newReschedule.medicationId && r.originalDate === newReschedule.originalDate && r.originalTime === newReschedule.originalTime)), newReschedule]);
  }, []);

  return {
    medications,
    takenLog,
    tempReschedules,
    isLoading,
    addMedication,
    updateMedication,
    deleteMedication,
    markAsTaken,
    unmarkAsTaken,
    getTakenStatus,
    addTemporaryReschedule,
  };
}

export const getMedicationsForDate = (
  medications: Medication[],
  takenLog: MedicationTakenLog,
  tempReschedules: TemporaryReschedule[],
  date: Date
): TodaysMedicationItem[] => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const dayOfWeek = format(date, 'EEEE').toLowerCase() as keyof NonNullable<Medication['customWeeklyDosages']>;
  
  let scheduledMedicationsForDate: TodaysMedicationItem[] = [];

  medications.forEach(med => {
    const activeReschedulesForMedOnDate = tempReschedules.filter(r => r.medicationId === med.id && r.originalDate === dateStr);

    const originalIntakesForDate: (DailyIntake & { originalTime: string })[] = [];

    if (med.frequencyType === 'daily' && med.dailyIntakes) {
      originalIntakesForDate.push(...med.dailyIntakes.map(intake => ({ ...intake, originalTime: intake.time })));
    } else if (med.frequencyType === 'custom_weekly' && med.customWeeklyDosages?.[dayOfWeek]) {
      originalIntakesForDate.push(...(med.customWeeklyDosages[dayOfWeek] || []).map(intake => ({ ...intake, originalTime: intake.time })));
    } else if (med.frequencyType === 'cyclical' && med.cyclicalPattern && med.cycleStartDate && med.cycleLength && med.cycleLength > 0) {
      const startDate = new Date(med.cycleStartDate);
      // Ensure cycleStartDate is treated as start of day for correct diff calculation
      const startDateMidnight = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      const diffDays = differenceInCalendarDays(dateMidnight, startDateMidnight);

      if (diffDays >= 0) { // Only proceed if selected date is on or after cycle start
        const cycleDayIndex = diffDays % med.cycleLength; // 0-indexed day in cycle
        const currentCycleDay = med.cyclicalPattern.find(d => d.day === cycleDayIndex + 1); // cyclePattern.day is 1-indexed
        if (currentCycleDay) {
          originalIntakesForDate.push(...currentCycleDay.intakes.map(intake => ({ ...intake, originalTime: intake.time })));
        }
      }
    }
    
    originalIntakesForDate.forEach(intake => {
      const reschedule = activeReschedulesForMedOnDate.find(r => r.originalTime === intake.originalTime && r.appliedDate === dateStr);
      // If we are viewing a past/future day where a reschedule might have been applied *on that day itself*
      // For now, only consider reschedules applied 'today' (current actual day) for the 'selectedDate' if selectedDate is today.
      // More robust logic would store 'appliedDate' with reschedule and filter if 'appliedDate' matches 'dateStr'
      
      let finalTime = intake.time;
      let isRescheduled = false;

      // Only apply reschedule if the selected date is the date the reschedule was intended for *and* applied on
      // This means a reschedule made on Monday for Monday's 08:00 dose to 09:00.
      // If viewing Monday, it should show 09:00. If viewing Tuesday, Monday's dose is still 08:00.
      // The current `addTemporaryReschedule` sets `appliedDate` to `today`.
      // `originalDate` is the date the dose was *originally* for.
      const relevantReschedule = tempReschedules.find(
        r => r.medicationId === med.id && 
             r.originalDate === dateStr && // Reschedule is for the day we are viewing
             r.originalTime === intake.originalTime &&
             r.appliedDate === dateStr // Reschedule was made *on* the day we are viewing
      );


      if (relevantReschedule) {
        finalTime = relevantReschedule.newTime;
        isRescheduled = true;
      }
      
      const isTaken = takenLog[med.id]?.[dateStr]?.[intake.originalTime]?.taken || false;
      
      scheduledMedicationsForDate.push({
        medication: med,
        intake: { ...intake, time: finalTime }, 
        scheduledTime: intake.originalTime, 
        isTaken,
        isRescheduled,
        date: dateStr, 
      });
    });
  });
  
  scheduledMedicationsForDate.sort((a, b) => a.intake.time.localeCompare(b.intake.time));
  
  return scheduledMedicationsForDate;
};
