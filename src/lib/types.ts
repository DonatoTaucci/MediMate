
export type DosageUnit = "pill" | "ml" | "mg" | "g" | "drop" | "puff" | "patch" | "unit" | "custom";

export interface DailyIntake {
  time: string; // HH:MM format
  dosage: number;
  unit: DosageUnit;
  customUnit?: string; // if unit is 'custom'
}

export interface CyclicalDosageDay {
  day: number; // e.g., Day 1, Day 2
  intakes: DailyIntake[];
}

export interface CustomWeeklyDosage {
  monday?: DailyIntake[];
  tuesday?: DailyIntake[];
  wednesday?: DailyIntake[];
  thursday?: DailyIntake[];
  friday?: DailyIntake[];
  saturday?: DailyIntake[];
  sunday?: DailyIntake[];
}

export type FrequencyType = "daily" | "cyclical" | "custom_weekly";

export interface Medication {
  id: string;
  name: string;
  color: string; // Hex color string
  icon?: string; // Lucide icon name or SVG string - for future use
  frequencyType: FrequencyType;
  
  dailyIntakes?: DailyIntake[];
  
  cyclicalPattern?: CyclicalDosageDay[]; 
  cycleLength?: number; 
  cycleStartDate?: string; // ISO date string

  customWeeklyDosages?: CustomWeeklyDosage;

  notes?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface MedicationTakenLog {
  [medicationId: string]: {
    [date: string]: { // YYYY-MM-DD
      [time: string]: { // HH:MM (scheduled time)
        taken: boolean;
        actualTakenTime?: string; // HH:MM if taken at a different time
      };
    };
  };
}

export interface TemporaryReschedule {
  medicationId: string;
  originalDate: string; // YYYY-MM-DD (Date the medication was originally scheduled for)
  originalTime: string; // HH:MM (Original scheduled time)
  newTime: string; // HH:MM (New time for the originalDate)
  appliedDate: string; // YYYY-MM-DD (Date the reschedule was made/applied)
}

export interface TodaysMedicationItem {
  medication: Medication;
  intake: DailyIntake & { originalTime?: string }; // intake.time is the effective time (could be rescheduled)
  scheduledTime: string; // This is the original scheduled time, used as key for takenLog and reschedules
  isTaken: boolean;
  isRescheduled: boolean;
  date: string; // YYYY-MM-DD string for which this medication item is being displayed
}
