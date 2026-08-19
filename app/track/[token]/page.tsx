import Image from "next/image";
import { CheckCircle2, Circle, XCircle } from "lucide-react";
import { getOrderTrackingByToken } from "@/lib/actions/orders";
import { formatDate } from "@/lib/format";
import { getServerLanguage } from "@/lib/i18n/get-server-language";

export const dynamic = "force-dynamic";

export default async function TrackOrderPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const { t } = await getServerLanguage();
  const stageLabels: Record<string, string> = t.track.stages;

  let info;
  try {
    info = await getOrderTrackingByToken(token);
  } catch (err) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-md text-center">
          <h1 className="font-serif text-2xl">{t.track.trackingUnavailable}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {err instanceof Error ? err.message : t.track.tryAgain}
          </p>
        </div>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-md text-center">
          <h1 className="font-serif text-2xl">{t.track.orderNotFound}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t.track.invalidLink}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center gap-3 mb-10">
          <Image src="/logo.png" alt="Khaiati" width={56} height={56} className="h-14 w-14 object-contain" />
          <h1 className="font-serif text-xl tracking-[0.2em]">KHAIATI</h1>
        </div>

        <div className="bg-card border border-border p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{t.track.orderLabel}</p>
          <h2 className="font-serif text-3xl mt-1">{info.orderNo}</h2>

          {info.canceled ? (
            <div className="mt-6 flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              <span className="text-sm font-medium">{t.track.canceled}</span>
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              {info.stages.map((stage) => (
                <div key={stage.key} className="flex items-start gap-3">
                  {stage.done ? (
                    <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  ) : stage.active ? (
                    <CheckCircle2 className="h-5 w-5 text-foreground shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0 mt-0.5" />
                  )}
                  <span
                    className={
                      stage.active
                        ? "text-sm font-medium text-foreground"
                        : stage.done
                          ? "text-sm text-muted-foreground"
                          : "text-sm text-muted-foreground/50"
                    }
                  >
                    {stageLabels[stage.key] ?? stage.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-border space-y-1 text-sm text-muted-foreground">
            {info.dueDate && <p>{t.track.estimatedCompletion} {formatDate(info.dueDate)}</p>}
            <p>{t.track.lastUpdated} {formatDate(info.lastUpdated)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
