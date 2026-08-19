"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { customerRegisterSchema, type CustomerRegisterInput } from "@/lib/validation/customer-auth";
import { registerCustomerAccount } from "@/lib/actions/customer-auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function CustomerRegisterPage() {
  const router = useRouter();
  const form = useForm<CustomerRegisterInput>({
    resolver: zodResolver(customerRegisterSchema),
    defaultValues: { name: "", email: "", phone: "", password: "" },
  });

  async function onSubmit(values: CustomerRegisterInput) {
    const result = await registerCustomerAccount(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) {
        toast.success("Account created — please sign in.");
        router.push("/account/login");
        return;
      }
      toast.success("Account created");
      router.push("/account");
      router.refresh();
    } catch {
      toast.success("Account created — please sign in.");
      router.push("/account/login");
    }
  }

  return (
    <div className="min-h-screen bg-secondary/20 px-6 py-16">
      <div className="mx-auto max-w-sm">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <Image src="/logo.png" alt="Khaiati" width={56} height={56} className="h-14 w-14 object-contain" />
          <span className="font-serif text-xl tracking-[0.2em]">KHAIATI</span>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl">Create Your Account</CardTitle>
            <CardDescription>
              Save your measurements, track orders, and book fittings across businesses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
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
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
                </Button>
              </form>
            </Form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/account/login" className="underline hover:text-accent">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
