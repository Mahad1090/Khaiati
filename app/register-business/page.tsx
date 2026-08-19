"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { businessRegistrationSchema, type BusinessRegistrationInput } from "@/lib/validation/business";
import { registerBusiness } from "@/lib/actions/businesses";

export default function RegisterBusinessPage() {
  const [submitted, setSubmitted] = useState<{ businessNo: string; accountCreated: boolean } | null>(null);

  const form = useForm<BusinessRegistrationInput>({
    resolver: zodResolver(businessRegistrationSchema),
    defaultValues: {
      name: "",
      ownerName: "",
      contactEmail: "",
      contactPhone: "",
      password: "",
      location: "",
      description: "",
    },
  });

  async function onSubmit(values: BusinessRegistrationInput) {
    const result = await registerBusiness(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setSubmitted({ businessNo: result.data.businessNo, accountCreated: result.data.accountCreated });
  }

  return (
    <div className="min-h-screen bg-secondary/20 px-6 py-16">
      <div className="mx-auto max-w-lg">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <Image src="/logo.png" alt="Khaiati" width={56} height={56} className="h-14 w-14 object-contain" />
          <span className="font-serif text-xl tracking-[0.2em]">KHAIATI</span>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl">List Your Business</CardTitle>
            <CardDescription>
              Submit your tailoring or fabric business for review. Once approved, you'll be listed
              on Khaiati.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-accent" />
                <p className="mt-4 font-serif text-lg">Application submitted</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Reference number <span className="font-medium text-foreground">{submitted.businessNo}</span>.
                  Our team will review your application and reach out.
                </p>
                {submitted.accountCreated ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your account is ready — sign in any time to check your application status.
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Sign-in isn&apos;t set up on this platform yet — you&apos;ll be contacted directly once reviewed.
                  </p>
                )}
                <div className="mt-6 flex justify-center gap-3">
                  {submitted.accountCreated && (
                    <Button asChild>
                      <Link href="/admin/login">Sign In</Link>
                    </Button>
                  )}
                  <Button asChild variant="outline">
                    <Link href="/">Back to Home</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Al-Fateh Tailors" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ownerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Owner Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@business.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="+92 300 1234567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="At least 8 characters" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>About Your Business (optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Services, specialties, years in business..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Submit for Review"
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
