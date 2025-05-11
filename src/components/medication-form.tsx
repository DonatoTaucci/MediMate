
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Medication, FrequencyType, DosageUnit, DailyIntake, CustomWeeklyDosage } from "@/lib/types";
import { Circle, PlusCircle, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

const dosageUnitOptions: { value: DosageUnit; label: string }[] = [
  { value: "pill", label: "Pill(s)" },
  { value: "ml", label: "ml" },
  { value: "mg", label: "mg" },
  { value: "g", label: "g" },
  { value: "drop", label: "Drop(s)" },
  { value: "puff", label: "Puff(s)" },
  { value: "patch", label: "Patch(es)" },
  { value: "unit", label: "Unit(s)" },
  { value: "custom", label: "Custom" },
];

const baseDosageValues = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5];

const generateDosageOptions = (currentValue?: number | string) => {
  const options = new Set(baseDosageValues);
  if (currentValue !== undefined) {
    const numericValue = Number(currentValue);
    if (!isNaN(numericValue)) {
      options.add(numericValue);
    }
  }
  return Array.from(options).sort((a,b) => a-b).map(v => ({ value: String(v), label: String(v) }));
};


const colors = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#FED766", "#2AB7CA",
  "#F0B67F", "#FE4A49", "#547980", "#8A9B0F", "#F7CAC9",
  "#92A8D1", "#FF8C94",
];

const dailyIntakeSchema = z.object({
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  dosage: z.coerce.number().min(0.01, "Dosage must be positive"),
  unit: z.custom<DosageUnit>((val) => dosageUnitOptions.map(o => o.value).includes(val as DosageUnit), "Invalid unit"),
  customUnit: z.string().optional(),
}).refine(data => data.unit !== 'custom' || (data.unit === 'custom' && data.customUnit && data.customUnit.trim() !== ''), {
  message: "Custom unit description is required",
  path: ["customUnit"],
});

const cyclicalDosageDaySchema = z.object({
  day: z.coerce.number().min(1, "Day must be 1 or greater"),
  intakes: z.array(dailyIntakeSchema).min(1, "At least one intake is required for a cycle day"),
});

const medicationFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format"),
  frequencyType: z.custom<FrequencyType>((val) => ["daily", "cyclical", "custom_weekly"].includes(val as FrequencyType), "Invalid frequency type"),
  notes: z.string().max(500).optional().default(""),

  dailyIntakes: z.array(dailyIntakeSchema).optional(),
  cyclicalPattern: z.array(cyclicalDosageDaySchema).optional(),
  cycleLength: z.coerce.number().min(1).optional(),
  cycleStartDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {message: "Invalid date format"}),
  customWeeklyDosages: z.object({
    monday: z.array(dailyIntakeSchema).optional(),
    tuesday: z.array(dailyIntakeSchema).optional(),
    wednesday: z.array(dailyIntakeSchema).optional(),
    thursday: z.array(dailyIntakeSchema).optional(),
    friday: z.array(dailyIntakeSchema).optional(),
    saturday: z.array(dailyIntakeSchema).optional(),
    sunday: z.array(dailyIntakeSchema).optional(),
  }).optional(),
})
.refine(data => data.frequencyType !== 'daily' || (data.dailyIntakes && data.dailyIntakes.length > 0), {
  message: "At least one daily intake is required for 'Daily' frequency.",
  path: ["dailyIntakes"],
})
.refine(data => data.frequencyType !== 'cyclical' || (data.cyclicalPattern && data.cyclicalPattern.length > 0 && data.cycleLength && data.cycleLength > 0 && data.cycleStartDate), {
  message: "Cyclical pattern, cycle length, and start date are required for 'Cyclical' frequency.",
  path: ["cyclicalPattern"], 
})
.refine(data => {
    if (data.frequencyType !== 'custom_weekly') return true;
    const { customWeeklyDosages } = data;
    if (!customWeeklyDosages) return false;
    return Object.values(customWeeklyDosages).some(dayIntakes => dayIntakes && dayIntakes.length > 0);
}, {
  message: "At least one intake for one day of the week is required for 'Custom Weekly' frequency.",
  path: ["customWeeklyDosages"],
});


type MedicationFormValues = z.infer<typeof medicationFormSchema>;

interface MedicationFormProps {
  initialData?: Medication;
  onSubmit: (data: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

function DailyIntakeFields({ control, form, nestIndex }: { control: any, form: any, nestIndex?: number }) {
  const pathPrefix = nestIndex !== undefined ? `cyclicalPattern.${nestIndex}.intakes` : `dailyIntakes`;
  const { fields, append, remove } = useFieldArray({
    control,
    name: pathPrefix
  });


  return (
    <div className="space-y-4">
      {fields.map((item, k) => {
        const currentDosageValue = form.watch(`${pathPrefix}.${k}.dosage`);
        const dynamicDosageOptions = generateDosageOptions(currentDosageValue);
        return (
        <div key={item.id} className="p-4 border rounded-md space-y-3 relative bg-card shadow-sm">
           <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => remove(k)}
            className="absolute top-2 right-2 text-destructive hover:text-destructive-foreground hover:bg-destructive"
            aria-label="Remove intake"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={control}
              name={`${pathPrefix}.${k}.time`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} value={field.value ?? ''} className="bg-background" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`${pathPrefix}.${k}.dosage`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dosage</FormLabel>
                    <Select
                        onValueChange={field.onChange}
                        value={field.value !== undefined ? String(field.value) : ""}
                    >
                        <FormControl>
                            <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Select dosage" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {dynamicDosageOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={control}
            name={`${pathPrefix}.${k}.unit`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-background"><SelectValue placeholder="Select unit" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {dosageUnitOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {form.watch(`${pathPrefix}.${k}.unit`) === 'custom' && (
            <FormField
              control={control}
              name={`${pathPrefix}.${k}.customUnit`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Unit Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Tablespoon" {...field} value={field.value ?? ''} className="bg-background" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        );
      })}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ time: "08:00", dosage: 1, unit: "pill", customUnit: undefined })}
        className="mt-2 border-dashed hover:border-solid"
      >
        <PlusCircle className="mr-2 h-4 w-4" /> Add Intake
      </Button>
    </div>
  );
}


export function MedicationForm({ initialData, onSubmit }: MedicationFormProps) {
  const defaultValues: MedicationFormValues = initialData
    ? {
        ...initialData,
        cycleStartDate: initialData.cycleStartDate ? new Date(initialData.cycleStartDate).toISOString().split('T')[0] : undefined,
        notes: initialData.notes ?? "",
        dailyIntakes: initialData.dailyIntakes?.map(intake => ({...intake, dosage: Number(intake.dosage)})) ?? [{ time: "08:00", dosage: 1, unit: "pill" as DosageUnit, customUnit: undefined }],
        cyclicalPattern: initialData.cyclicalPattern?.map(cp => ({...cp, intakes: cp.intakes.map(intake => ({...intake, dosage: Number(intake.dosage)}))})) ?? [],
        customWeeklyDosages: initialData.customWeeklyDosages ? Object.fromEntries(
            Object.entries(initialData.customWeeklyDosages).map(([day, intakes]) => [
                day,
                intakes?.map(intake => ({...intake, dosage: Number(intake.dosage)}))
            ])
        ) as CustomWeeklyDosage : {
            monday: [], tuesday: [], wednesday: [], thursday: [],
            friday: [], saturday: [], sunday: [],
        },
      }
    : {
        name: "",
        color: colors[0],
        frequencyType: "daily" as FrequencyType,
        dailyIntakes: [{ time: "08:00", dosage: 1, unit: "pill" as DosageUnit, customUnit: undefined }],
        notes: "",
        cycleStartDate: undefined,
        cycleLength: undefined,
        cyclicalPattern: [],
        customWeeklyDosages: {
            monday: [], tuesday: [], wednesday: [], thursday: [],
            friday: [], saturday: [], sunday: [],
        },
      };

  const form = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationFormSchema),
    defaultValues,
  });

  const frequencyType = form.watch("frequencyType");

  const { fields: cyclicalFields, append: appendCycleDay, remove: removeCycleDay } = useFieldArray({
    control: form.control,
    name: "cyclicalPattern"
  });

  const daysOfWeek: (keyof CustomWeeklyDosage)[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  function handleFormSubmit(values: MedicationFormValues) {
    const dataToSubmit: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'> = {
        name: values.name,
        color: values.color,
        frequencyType: values.frequencyType,
        notes: values.notes || "", 
    };

    if (values.frequencyType === 'daily') {
        dataToSubmit.dailyIntakes = values.dailyIntakes?.map(intake => ({...intake, dosage: Number(intake.dosage)}));
    } else if (values.frequencyType === 'cyclical') {
        dataToSubmit.cyclicalPattern = values.cyclicalPattern?.map(cp => ({...cp, day: Number(cp.day), intakes: cp.intakes.map(intake => ({...intake, dosage: Number(intake.dosage)}))}));
        dataToSubmit.cycleLength = values.cycleLength ? Number(values.cycleLength) : undefined;
        dataToSubmit.cycleStartDate = values.cycleStartDate ? new Date(values.cycleStartDate).toISOString() : undefined;
    } else if (values.frequencyType === 'custom_weekly') {
        dataToSubmit.customWeeklyDosages = values.customWeeklyDosages ? Object.fromEntries(
            Object.entries(values.customWeeklyDosages).map(([day, intakes]) => [
                day,
                intakes?.map(intake => ({...intake, dosage: Number(intake.dosage)}))
            ])
        ) as CustomWeeklyDosage : undefined;
    }
    onSubmit(dataToSubmit);
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medication Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Paracetamol" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormDescription>Enter the name of the medication.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Identifier Color</FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-2 items-center">
                  {colors.map(color => (
                    <Button
                      key={color}
                      type="button"
                      variant="outline"
                      size="icon"
                      className={cn("h-8 w-8 rounded-full border-2", field.value === color && "ring-2 ring-ring ring-offset-2")}
                      style={{ backgroundColor: color }}
                      onClick={() => field.onChange(color)}
                      aria-label={`Select color ${color}`}
                    >
                      {field.value === color && <Circle className="h-4 w-4 fill-primary-foreground text-primary-foreground" />}
                    </Button>
                  ))}
                   <Input type="color" {...field} value={field.value ?? colors[0]} className="h-10 w-16 p-1" />
                </div>
              </FormControl>
              <FormDescription>Choose a color to identify this medication.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="frequencyType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frequency</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="daily">Daily (Same time(s) everyday)</SelectItem>
                  <SelectItem value="cyclical">Cyclical (e.g., Day 1: X, Day 2: Y)</SelectItem>
                  <SelectItem value="custom_weekly">Custom Weekly (Different dosages per day of week)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {frequencyType === "daily" && (
          <FormItem>
            <FormLabel className="text-lg font-semibold">Daily Intakes</FormLabel>
            <DailyIntakeFields control={form.control} form={form} />
             <FormMessage>{form.formState.errors.dailyIntakes?.message}</FormMessage>
          </FormItem>
        )}

        {frequencyType === "cyclical" && (
          <div className="space-y-6 p-4 border rounded-md bg-card shadow-sm">
            <h3 className="text-lg font-semibold">Cyclical Dosage Pattern</h3>
            <FormField
              control={form.control}
              name="cycleStartDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cycle Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value ?? ''} className="bg-background"/>
                  </FormControl>
                  <FormDescription>The date when this cycle pattern begins.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="cycleLength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cycle Length (days)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 7 for a 7-day cycle" {...field} value={field.value ?? ''} className="bg-background"/>
                  </FormControl>
                   <FormDescription>Total number of days in one complete cycle.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4">
              {cyclicalFields.map((cycleDay, index) => (
                <div key={cycleDay.id} className="p-4 border rounded-md space-y-3 relative bg-background shadow-inner">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCycleDay(index)}
                    className="absolute top-2 right-2 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                    aria-label="Remove cycle day"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                   <FormField
                      control={form.control}
                      name={`cyclicalPattern.${index}.day`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cycle Day Number</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder={`e.g., ${index + 1}`} {...field} value={field.value ?? ''} className="bg-background"/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  <DailyIntakeFields control={form.control} form={form} nestIndex={index} />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendCycleDay({ day: cyclicalFields.length + 1, intakes: [{ time: "08:00", dosage: 1, unit: "pill", customUnit: undefined }] })}
                className="mt-2 border-dashed hover:border-solid"
              >
                 <PlusCircle className="mr-2 h-4 w-4" /> Add Cycle Day
              </Button>
            </div>
            <FormMessage>{(form.formState.errors.cyclicalPattern as any)?.message || form.formState.errors.cycleLength?.message || form.formState.errors.cycleStartDate?.message}</FormMessage>
          </div>
        )}

        {frequencyType === "custom_weekly" && (
           <div className="space-y-6 p-4 border rounded-md bg-card shadow-sm">
            <h3 className="text-lg font-semibold">Custom Weekly Dosages</h3>
            {daysOfWeek.map(day => (
              <div key={day} className="space-y-3 p-3 border rounded-md bg-background shadow-inner">
                <h4 className="font-medium capitalize text-md">{day}</h4>
                <CustomWeeklyDayFields control={form.control} form={form} dayOfWeek={day} />
              </div>
            ))}
            <FormMessage>{(form.formState.errors.customWeeklyDosages as any)?.message}</FormMessage>
          </div>
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Take with food, avoid dairy..." {...field} value={field.value ?? ''} />
              </FormControl>
              <FormDescription>Any other important information about this medication.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="lg" className="w-full sm:w-auto">
          {initialData ? "Update Medication" : "Add Medication"}
        </Button>
      </form>
    </Form>
  );
}


function CustomWeeklyDayFields({ control, form, dayOfWeek }: { control: any, form: any, dayOfWeek: keyof CustomWeeklyDosage }) {
  const pathPrefix = `customWeeklyDosages.${dayOfWeek}`;
  const { fields, append, remove } = useFieldArray({
    control,
    name: pathPrefix
  });

  return (
    <div className="space-y-4">
      {fields.map((item, k) => {
         const currentDosageValue = form.watch(`${pathPrefix}.${k}.dosage`);
         const dynamicDosageOptions = generateDosageOptions(currentDosageValue);
        return (
        <div key={item.id} className="p-3 border rounded-sm space-y-3 relative bg-card shadow-sm">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => remove(k)}
            className="absolute top-1 right-1 text-destructive hover:text-destructive-foreground hover:bg-destructive p-1 h-auto"
            aria-label="Remove intake"
          >
            <X className="h-3 w-3" />
          </Button>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              control={control}
              name={`${pathPrefix}.${k}.time`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} value={field.value ?? ''} className="bg-background h-9 text-sm" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`${pathPrefix}.${k}.dosage`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Dosage</FormLabel>
                    <Select
                        onValueChange={field.onChange}
                        value={field.value !== undefined ? String(field.value) : ""}
                    >
                        <FormControl>
                            <SelectTrigger className="bg-background h-9 text-sm">
                                <SelectValue placeholder="Dosage" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {dynamicDosageOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value} className="text-sm">{opt.label}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={control}
            name={`${pathPrefix}.${k}.unit`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Unit</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-background h-9 text-sm"><SelectValue placeholder="Unit" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {dosageUnitOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value} className="text-sm">{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {form.watch(`${pathPrefix}.${k}.unit`) === 'custom' && (
            <FormField
              control={control}
              name={`${pathPrefix}.${k}.customUnit`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Custom Unit Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Tablespoon" {...field} value={field.value ?? ''} className="bg-background h-9 text-sm" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        );
      })}
       <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
            const currentDayIntakes = form.getValues(pathPrefix);
            if (!currentDayIntakes || !Array.isArray(currentDayIntakes)) {
                form.setValue(pathPrefix, []);
            }
            append({ time: "08:00", dosage: 1, unit: "pill", customUnit: undefined })
        }}
        className="mt-1 border-dashed hover:border-solid text-xs h-8"
      >
        <PlusCircle className="mr-1 h-3 w-3" /> Add Intake for {dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)}
      </Button>
    </div>
  );
}


    