"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/language-context";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
      router.push(searchParams.get("next") || "/admin");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.adminLogin.unavailable);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">{t.adminLogin.email}</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      <div>
        <Label htmlFor="password">{t.adminLogin.password}</Label>
        <Input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.adminLogin.signIn}
      </Button>
    </form>
  );
}

export default function AdminLoginPage() {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <Image src="/logo.png" alt="Khaiati" width={64} height={64} className="h-16 w-16 object-contain" />
          <CardTitle className="font-serif text-xl">{t.adminLogin.title}</CardTitle>
          <CardDescription>{t.adminLogin.subtitle}</CardDescription>
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
