"use client";

import { rankOptions } from "@/app/constants/general/ranks";
import { MedicCredentials as MedicCredentialsShape } from "@/app/context/MedicContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormik } from "formik";
import * as Yup from "yup";

// Re-exported so existing imports from this file (signature, StaffSettingsCard)
// keep working without rewrites after the canonical type moved to MedicContext.
export type MedicCredentials = MedicCredentialsShape;

type Props = {
  medicCredentials: MedicCredentials;
  setMedicCredentialsAction: React.Dispatch<
    React.SetStateAction<MedicCredentials>
  >;
  /**
   * Show the rank picker. Only for the members Discord resolves no rank for -
   * the registry can't name every role id yet, and without this they would have
   * no rank at all, which blocks every tool that generates a document.
   */
  showRankFallback?: boolean;
};

export function MedicCredentials({
  medicCredentials,
  setMedicCredentialsAction,
  showRankFallback = false,
}: Props) {
  const formik = useFormik({
    // The name, rank and director role are Discord's, filled in by the Staff
    // Page's automatic pass - this form only ever submits the signature, plus
    // the rank for the members mentioned above.
    initialValues: {
      signature: medicCredentials.signature,
      rank: medicCredentials.rank,
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      signature: Yup.string().required("Signature is required"),
      rank: showRankFallback
        ? Yup.string().required("Rank is required")
        : Yup.string(),
    }),
    onSubmit: (values) => {
      // Spread what is already saved so the fields this form doesn't own - the
      // name and the director role - survive a submit untouched.
      setMedicCredentialsAction((prev) => ({
        ...prev,
        signature: values.signature,
        rank: showRankFallback ? values.rank : prev.rank,
      }));
    },
  });

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="flex w-full max-w-sm flex-col items-center gap-4"
    >
      <Input
        id="signature"
        name="signature"
        type="text"
        placeholder="Enter your signature"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values.signature}
      />
      {formik.touched.signature && formik.errors.signature && (
        <span className="text-sm text-red-500">{formik.errors.signature}</span>
      )}

      {showRankFallback && (
        <>
          <p className="w-full text-xs text-muted-foreground">
            Discord doesn&apos;t resolve a rank for your account yet, so set it
            here.
          </p>
          <Select
            value={formik.values.rank}
            onValueChange={(value) => formik.setFieldValue("rank", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your rank" />
            </SelectTrigger>
            <SelectContent>
              {rankOptions.map((rank) => (
                <SelectItem key={rank} value={rank}>
                  {rank}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formik.touched.rank && formik.errors.rank && (
            <span className="text-sm text-red-500">{formik.errors.rank}</span>
          )}
        </>
      )}

      <Button className="cursor-pointer" variant="outline" type="submit">
        Submit
      </Button>
    </form>
  );
}
