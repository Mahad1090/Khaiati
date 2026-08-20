"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/language-context";

function LoginForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // After signing in, send the customer back to wherever they came from
  // (e.g. the page they were ordering from) rather than trapping them on
  // the bare account page. Defaults to the homepage.
  const nextPath = searchParams.get("next") || "/";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
        return;
      }
      router.push(nextPath);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.accountLogin.unavailable);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">{t.accountLogin.email}</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="password">{t.accountLogin.password}</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.accountLogin.signIn}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        {t.accountLogin.noAccount}{" "}
        <Link
          href={nextPath !== "/" ? `/account/register?next=${encodeURIComponent(nextPath)}` : "/account/register"}
          className="underline hover:text-accent"
        >
          {t.accountLogin.createOne}
        </Link>
      </p>
    </>
  );
}

export default function CustomerLoginPage() {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/20 px-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <Link href="/" className="mb-2 flex items-center gap-3">
            <Image src="/logo.png" alt="Khaiati" width={56} height={56} className="h-14 w-14 object-contain" />
          </Link>
          <CardTitle className="font-serif text-xl">{t.accountLogin.title}</CardTitle>
          <CardDescription>{t.accountLogin.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}