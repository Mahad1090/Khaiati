import QRCode from "qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerLanguage } from "@/lib/i18n/get-server-language";

export async function OrderTrackingCard({ trackingToken }: { trackingToken: string }) {
  const { t } = await getServerLanguage();
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const trackingUrl = `${base.replace(/\/$/, "")}/track/${trackingToken}`;
  const qrDataUrl = await QRCode.toDataURL(trackingUrl, { width: 180, margin: 1 });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{t.orders.trackingTitle}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} alt="Order tracking QR code" className="h-36 w-36 border border-border" />
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {t.orders.trackingDesc}
          </p>
          <a
            href={trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block break-all text-sm text-accent hover:underline"
          >
            {trackingUrl}
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
