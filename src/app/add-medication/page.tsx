"use client";

import { MedicationForm } from '@/components/medication-form';
import { useMedications } from '@/hooks/use-medications';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Medication } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AddMedicationPage() {
  const router = useRouter();
  const { addMedication } = useMedications();
  const { toast } = useToast();

  const handleSubmit = (data: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      addMedication(data);
      toast({
        title: "Medication Added",
        description: `${data.name} has been successfully added.`,
      });
      router.push('/');
    } catch (error) {
      console.error("Failed to add medication:", error);
      toast({
        title: "Error",
        description: "Failed to add medication. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-6 ml-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Add New Medication</CardTitle>
          <CardDescription>
            Fill in the details below to add a new medication to your schedule.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MedicationForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
