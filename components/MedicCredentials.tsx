"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFormik } from "formik";
import * as Yup from "yup";

type Props = {
  medicCredentials: {
    name: string;
    signature: string;
    rank: string;
  };
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

      <Input
        id="rank"
        name="rank"
        type="text"
        placeholder="Enter your rank"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values.rank}
      />
      {formik.touched.rank && formik.errors.rank && (
        <span className="text-sm text-red-500">{formik.errors.rank}</span>
      )}

      <Button variant="outline" type="submit">
        Submit
      </Button>
    </form>
  );
}
