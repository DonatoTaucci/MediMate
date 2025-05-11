"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MedicationForm } from '@/components/medication-form';
import { useMedications } from '@/hooks/use-medications';
import { useToast } from '@/hooks/use-toast';
import type { Medication } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function EditMedicationPage() {
  const router = useRouter();
  const params = useParams();
  const medicationId = typeof params.id === 'string' ? params.id : undefined;
  
  const { medications, updateMedication, isLoading: medicationsLoading } = useMedications();
  const { toast } = useToast();
  
  const [initialData, setInitialData] = useState<Medication | undefined>(undefined);
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  useEffect(() => {
    if (!medicationsLoading && medicationId) {
      const med = medications.find(m => m.id === medicationId);
      if (med) {
        setInitialData(med);
      } else {
        toast({
          title: "Error",
          description: "Medication not found.",
          variant: "destructive",
        });
        router.replace('/'); // Redirect if not found
      }
      setIsLoadingPage(false);
    } else if (!medicationsLoading && !medicationId) {
        // Handle case where ID is missing, though Next.js routing should prevent this usually
        toast({ title: "Error", description: "Medication ID is missing.", variant: "destructive" });
        router.replace('/');
        setIsLoadingPage(false);
    }
  }, [medicationId, medications, medicationsLoading, router, toast]);

  const handleSubmit = (data: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!medicationId) return;
    try {
      updateMedication(medicationId, data);
      toast({
        title: "Medication Updated",
        description: `${data.name} has been successfully updated.`,
      });
      router.push('/');
    } catch (error) {
      console.error("Failed to update medication:", error);
      toast({
        title: "Error",
        description: "Failed to update medication. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingPage || medicationsLoading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!initialData) {
    // This case should ideally be handled by redirection above, but as a fallback:
    return (
        <div className="container py-8 text-center">
            <p className="text-destructive-foreground">Medication data could not be loaded.</p>
            <Button asChild className="mt-4"><Link href="/">Go to Dashboard</Link></Button>
        </div>
    );
  }

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
          <CardTitle className="text-2xl">Edit Medication</CardTitle>
          <CardDescription>
            Update the details for {initialData.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MedicationForm initialData={initialData} onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
