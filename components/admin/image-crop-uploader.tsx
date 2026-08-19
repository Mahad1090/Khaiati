"use client";

import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { getCroppedImageBlob } from "@/lib/crop-image";
import { uploadDesignImage } from "@/lib/actions/uploads";
import { useLanguage } from "@/lib/i18n/language-context";

type Props = {
  onUploaded: (path: string) => void;
  previewUrl?: string | null;
};

/** Upload -> crop -> confirm -> upload to storage -> hand back the storage path. */
export function ImageCropUploader({ onUploaded, previewUrl }: Props) {
  const { t } = useLanguage();
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRawImage(reader.result as string);
      setDialogOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedArea(areaPixels);
  }, []);

  async function confirmCrop() {
    if (!rawImage || !croppedArea) return;
    setBusy(true);
    try {
      const blob = await getCroppedImageBlob(rawImage, croppedArea);
      const formData = new FormData();
      formData.append("file", new File([blob], "design.jpg", { type: "image/jpeg" }));
      const result = await uploadDesignImage(formData);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      onUploaded(result.data.path);
      toast.success(t.settingsPage.imageUploaded);
      setDialogOpen(false);
      setRawImage(null);
    } catch (err) {
      console.error(err);
      toast.error(t.settingsPage.couldNotProcessImage);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt="Design preview"
          className="h-32 w-32 rounded-md border border-border object-cover"
        />
      ) : (
        <div className="flex h-32 w-32 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground">
          <ImagePlus className="h-6 w-6" />
        </div>
      )}

      <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-accent hover:underline">
        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFileChange} />
        {t.settingsPage.chooseImage}
      </label>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t.settingsPage.cropImage}</DialogTitle>
          </DialogHeader>
          <div className="relative h-72 w-full bg-muted">
            {rawImage && (
              <Cropper
                image={rawImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>
          <Slider
            value={[zoom]}
            min={1}
            max={3}
            step={0.1}
            onValueChange={([v]) => setZoom(v)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={busy}>
              {t.settingsPage.cancel}
            </Button>
            <Button onClick={confirmCrop} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : t.settingsPage.saveImage}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
