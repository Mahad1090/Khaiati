import { z } from "zod";
import type { GarmentType } from "./design";

// Union of every measurement field used across garment types. The
// garment_measurements table has one column per field; each garment type
// only uses a subset, defined below.
export const measurementFieldKeys = [
  "height",
  "sleeve",
  "shoulder",
  "neck",
  "armhole",
  "armpit",
  "chest",
  "waist",
  "hip",
  "inseam",
] as const;

export type MeasurementFieldKey = (typeof measurementFieldKeys)[number];

export const measurementFieldLabels: Record<MeasurementFieldKey, string> = {
  height: "Height",
  sleeve: "Sleeve",
  shoulder: "Shoulder",
  neck: "Neck",
  armhole: "Armhole",
  armpit: "Armpit",
  chest: "Chest",
  waist: "Waist",
  hip: "Hip",
  inseam: "Inseam",
};

// Which fields apply to which garment type, per the Khaiati requirements doc.
export const garmentMeasurementFields: Record<GarmentType, MeasurementFieldKey[]> = {
  shirt: ["height", "sleeve", "shoulder", "neck", "armhole", "chest", "waist", "hip"],
  vest: ["height", "shoulder", "neck", "armpit", "waist", "hip"],
  coat: ["height", "sleeve", "shoulder", "neck", "armpit", "hip", "waist", "chest"],
  pants: ["height", "armpit", "waist", "hip"],
  jacket: ["height", "sleeve", "shoulder", "neck", "armpit", "hip", "waist", "chest"],
};

const measurementNumber = z
  .union([z.string(), z.number()])
  .transform((v) => (v === "" || v === undefined ? undefined : Number(v)))
  .refine((v) => v === undefined || (Number.isFinite(v) && v >= 0 && v < 1000), {
    message: "Enter a measurement between 0 and 1000",
  })
  .optional();

export const measurementsSchema = z
  .object(
    Object.fromEntries(
      measurementFieldKeys.map((key) => [key, measurementNumber])
    ) as Record<MeasurementFieldKey, typeof measurementNumber>
  )
  .extend({
    note: z.string().trim().max(2000).optional().or(z.literal("")),
  });

export type MeasurementsInput = z.infer<typeof measurementsSchema>;
