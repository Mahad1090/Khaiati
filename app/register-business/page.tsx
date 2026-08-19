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
import { useLanguage } from "@/lib/i18n/language-context";

export default function RegisterBusinessPage() {
  const { t } = useLanguage();
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
            <CardTitle className="font-serif text-2xl">{t.registerBusiness.title}</CardTitle>
            <CardDescription>
              {t.registerBusiness.subtitle}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-accent" />
                <p className="mt-4 font-serif text-lg">{t.registerBusiness.submittedTitle}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t.registerBusiness.referenceNumber} <span className="font-medium text-foreground">{submitted.businessNo}</span>.
                  {" "}{t.registerBusiness.referenceSuffix}
                </p>
                {submitted.accountCreated ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t.registerBusiness.accountReady}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t.registerBusiness.accountNotReady}
                  </p>
                )}
                <div className="mt-6 flex justify-center gap-3">
                  {submitted.accountCreated && (
                    <Button asChild>
                      <Link href="/admin/login">{t.registerBusiness.signIn}</Link>
                    </Button>
                  )}
                  <Button asChild variant="outline">
                    <Link href="/">{t.registerBusiness.backToHome}</Link>
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
                        <FormLabel>{t.registerBusiness.businessName}</FormLabel>
                        <FormControl>
                          <Input placeholder={t.registerBusiness.businessNamePlaceholder} {...field} />
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
                        <FormLabel>{t.registerBusiness.ownerName}</FormLabel>
                        <FormControl>
                          <Input placeholder={t.registerBusiness.ownerNamePlaceholder} {...field} />
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
                          <FormLabel>{t.registerBusiness.email}</FormLabel>
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
                          <FormLabel>{t.registerBusiness.phone}</FormLabel>
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
                        <FormLabel>{t.registerBusiness.password}</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder={t.registerBusiness.passwordPlaceholder} {...field} />
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
                        <FormLabel>{t.registerBusiness.location}</FormLabel>
                        <FormControl>
                          <Input placeholder={t.registerBusiness.locationPlaceholder} {...field} />
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
                        <FormLabel>{t.registerBusiness.about}</FormLabel>
                        <FormControl>
                          <Textarea placeholder={t.registerBusiness.aboutPlaceholder} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t.registerBusiness.submit
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
