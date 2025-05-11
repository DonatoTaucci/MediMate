
"use client";

import { useEffect, useState, useRef } from 'react';
import type { TodaysMedicationItem, MedicationTakenLog } from '@/lib/types';
import { format, parse, addMinutes, subMinutes, isFuture, isPast } from 'date-fns';

// Helper to create a unique key for a notification
const getNotificationKey = (medicationId: string, date: string, scheduledTime: string, type: 'PRE_DOSE' | 'MISSED_DOSE') => `${medicationId}-${date}-${scheduledTime}-${type}`;

const MEDICATION_TAKEN_LOG_KEY = 'medicationTakenLog'; // Define if not already globally available

export function useNotificationScheduler(
  medicationsToday: TodaysMedicationItem[], // Only for the actual current day
  takenLog: MedicationTakenLog // Pass the up-to-date takenLog
) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const scheduledTimeouts = useRef<NodeJS.Timeout[]>([]);
  const shownNotifications = useRef<Set<string>>(new Set()); // Tracks shown notifications to avoid duplicates

  // Request permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted') {
        Notification.requestPermission().then((status) => {
          setPermission(status);
          if (status !== 'granted') {
            console.info("Notification permission not granted. Reminders will not be shown.");
          }
        });
      } else {
        setPermission(Notification.permission);
      }
    } else {
        console.warn("Notifications API not available in this browser.");
    }
  }, []);

  // Function to show notification
  const showNotification = (title: string, options?: NotificationOptions) => {
    if (permission === 'granted' && typeof window !== 'undefined' && 'Notification' in window) {
      new Notification(title, options);
    }
  };

  // Schedule/clear notifications
  useEffect(() => {
    scheduledTimeouts.current.forEach(clearTimeout);
    scheduledTimeouts.current = [];

    if (permission !== 'granted' || typeof window === 'undefined' || !medicationsToday) {
      return;
    }

    const now = new Date();
    const todayStr = format(now, 'yyyy-MM-dd');

    medicationsToday.forEach((item) => {
      // Ensure item is for today for notification scheduling
      if (item.date !== todayStr) return;

      const { medication, intake, scheduledTime: originalScheduledTime } = item;
      // Use item.isTaken directly as it's derived from the up-to-date takenLog
      const isCurrentlyTaken = item.isTaken;


      if (isCurrentlyTaken) {
        shownNotifications.current.delete(getNotificationKey(medication.id, item.date, originalScheduledTime, 'PRE_DOSE'));
        shownNotifications.current.delete(getNotificationKey(medication.id, item.date, originalScheduledTime, 'MISSED_DOSE'));
        return;
      }
      
      const scheduledDateTime = parse(`${item.date} ${intake.time}`, 'yyyy-MM-dd HH:mm', new Date());

      // 1. Pre-dose notification (10 minutes before)
      const preDoseNotificationKey = getNotificationKey(medication.id, item.date, originalScheduledTime, 'PRE_DOSE');
      if (!shownNotifications.current.has(preDoseNotificationKey)) {
        const preDoseTime = subMinutes(scheduledDateTime, 10);
        if (isFuture(preDoseTime) && !isCurrentlyTaken) {
          const delay = preDoseTime.getTime() - now.getTime();
          const timeoutId = setTimeout(() => {
            // Final check before showing, in case state changed rapidly
             const latestTakenLog = JSON.parse(localStorage.getItem(MEDICATION_TAKEN_LOG_KEY) || '{}');
             const stillNotTaken = !latestTakenLog[medication.id]?.[item.date]?.[originalScheduledTime]?.taken;

            if (stillNotTaken && !shownNotifications.current.has(preDoseNotificationKey)) {
              showNotification(
                `Reminder: ${medication.name}`,
                { body: `Time to take your ${medication.name} (${intake.dosage} ${intake.unit}) in 10 minutes at ${intake.time}.`, tag: preDoseNotificationKey }
              );
              shownNotifications.current.add(preDoseNotificationKey);
            }
          }, delay);
          scheduledTimeouts.current.push(timeoutId);
        }
      }

      // 2. Missed-dose notification (e.g., 1 minute after scheduled time)
      const missedDoseNotificationKey = getNotificationKey(medication.id, item.date, originalScheduledTime, 'MISSED_DOSE');
      if (!isCurrentlyTaken && !shownNotifications.current.has(missedDoseNotificationKey)) {
        const missedTimeThreshold = addMinutes(scheduledDateTime, 1); 

        if (isPast(missedTimeThreshold)) { 
          showNotification(
            `Missed Dose: ${medication.name}`,
            { body: `You may have missed your dose of ${medication.name} (${intake.dosage} ${intake.unit}) scheduled for ${intake.time}.`, tag: missedDoseNotificationKey }
          );
          shownNotifications.current.add(missedDoseNotificationKey);
        } else { 
          const delay = missedTimeThreshold.getTime() - now.getTime();
          if (delay > 0) { // Ensure delay is positive
            const timeoutId = setTimeout(() => {
              const latestTakenLog = JSON.parse(localStorage.getItem(MEDICATION_TAKEN_LOG_KEY) || '{}');
              const stillNotTakenWhenFired = !latestTakenLog[medication.id]?.[item.date]?.[originalScheduledTime]?.taken;

              if (stillNotTakenWhenFired && !shownNotifications.current.has(missedDoseNotificationKey)) {
                  showNotification(
                      `Missed Dose: ${medication.name}`,
                      { body: `You may have missed your dose of ${medication.name} (${intake.dosage} ${intake.unit}) scheduled for ${intake.time}.`, tag: missedDoseNotificationKey }
                  );
                  shownNotifications.current.add(missedDoseNotificationKey);
              }
            }, delay);
            scheduledTimeouts.current.push(timeoutId);
          }
        }
      }
    });

    return () => {
      scheduledTimeouts.current.forEach(clearTimeout);
    };
  }, [medicationsToday, takenLog, permission]); 

  // Effect to reset shownNotifications daily
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const lastResetKey = 'notifications_last_reset_date_v2'; // Use a new key if logic changes
    
    if (typeof window !== 'undefined') {
        const storedLastReset = localStorage.getItem(lastResetKey);
        if (storedLastReset !== today) {
          shownNotifications.current.clear();
          localStorage.setItem(lastResetKey, today);
          console.log("Notification tracker (shownNotifications) reset for the new day.");
        }
    }
  }, []);
}
