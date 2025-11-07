"use client";

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

const ranks = [
  "Chief of LSEMS",
  "Assistant Chief",
  "Deputy Chief",
  "Lieutenant",
  "Commander",
  "Lead Paramedic",
  "Senior Paramedic",
  "Paramedic",
  "Junior Paramedic",
  "Master EMT",
  "EMT-A",
  "EMT-I",
  "EMT-B",
  "EMR",
];

export type MedicCredentials = {
  name: string;
  signature: string;
  rank: string;
};

type Props = {
  medicCredentials: MedicCredentials;
  setMedicCredentialsAction: React.Dispatch<
    React.SetStateAction<{
      name: string;
      signature: string;
      rank: string;
    }>
  >;
};

export function MedicCredentials({
  medicCredentials,
  setMedicCredentialsAction,
}: Props) {
  const formik = useFormik({
    initialValues: medicCredentials,
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      signature: Yup.string().required("Signature is required"),
      rank: Yup.string().required("Rank is required"),
    }),
    onSubmit: (values) => {
      setMedicCredentialsAction(values);
    },
  });

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="flex w-full max-w-sm flex-col items-center gap-4"
    >
      <Input
        id="name"
        name="name"
        type="text"
        placeholder="Enter your name"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values.name}
      />
      {formik.touched.name && formik.errors.name && (
        <span className="text-sm text-red-500">{formik.errors.name}</span>
      )}

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

      <Select
        value={formik.values.rank}
        onValueChange={(value) => formik.setFieldValue("rank", value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select your rank" />
        </SelectTrigger>
        <SelectContent>
          {ranks.map((rank) => (
            <SelectItem key={rank} value={rank}>
              {rank}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {formik.touched.rank && formik.errors.rank && (
        <span className="text-sm text-red-500">{formik.errors.rank}</span>
      )}

      <Button className="cursor-pointer" variant="outline" type="submit">
        Submit
      </Button>
    </form>
  );
}
