"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { useLanguage } from "@/lib/i18n/language-context";

function RegisterForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const form = useForm<CustomerRegisterInput>({
    resolver: zodResolver(customerRegisterSchema),
    defaultValues: { name: "", email: "", phone: "", password: "" },
  });

  // After registering, send the customer back to wherever they came from
  // (e.g. the page they were ordering from) rather than trapping them on
  // the bare account page. Defaults to the homepage.
  const nextPath = searchParams.get("next") || "/";
  const loginUrl = nextPath !== "/" ? `/account/login?next=${encodeURIComponent(nextPath)}` : "/account/login";

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
        toast.success(t.accountRegister.accountCreatedSignIn);
        router.push(loginUrl);
        return;
      }
      toast.success(t.accountRegister.accountCreated);
      router.push(nextPath);
      router.refresh();
    } catch {
      toast.success(t.accountRegister.accountCreatedSignIn);
      router.push(loginUrl);
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.accountRegister.name}</FormLabel>
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
                <FormLabel>{t.accountRegister.email}</FormLabel>
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
                <FormLabel>{t.accountRegister.phone}</FormLabel>
                <FormControl>
                  <Input placeholder={t.accountRegister.phonePlaceholder} {...field} />
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
                <FormLabel>{t.accountRegister.password}</FormLabel>
                <FormControl>
                  <Input type="password" placeholder={t.accountRegister.passwordPlaceholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.accountRegister.createAccount}
          </Button>
        </form>
      </Form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        {t.accountRegister.alreadyHaveAccount}{" "}
        <Link href={loginUrl} className="underline hover:text-accent">
          {t.accountRegister.signIn}
        </Link>
      </p>
    </>
  );
}

export default function CustomerRegisterPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-secondary/20 px-6 py-16">
      <div className="mx-auto max-w-sm">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <Image src="/logo.png" alt="Khaiati" width={56} height={56} className="h-14 w-14 object-contain" />
          <span className="font-serif text-xl tracking-[0.2em]">KHAIATI</span>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl">{t.accountRegister.title}</CardTitle>
            <CardDescription>
              {t.accountRegister.subtitle}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={null}>
              <RegisterForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}