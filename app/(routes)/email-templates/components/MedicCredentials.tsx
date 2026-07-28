"use client";

import {
  defaultDirectorRole,
  directorRoleTitles,
  type DirectorRole,
} from "@/app/constants/general/directorRoles";
import { ranks } from "@/app/constants/general/LSEMSRanks";
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
};

const initialDirectorRole: DirectorRole = {
  enabled: defaultDirectorRole.enabled,
  title: defaultDirectorRole.title,
};

export function MedicCredentials({
  medicCredentials,
  setMedicCredentialsAction,
}: Props) {
  const formik = useFormik({
    initialValues: {
      ...medicCredentials,
      directorRole: {
        ...initialDirectorRole,
        ...medicCredentials.directorRole,
      },
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      signature: Yup.string().required("Signature is required"),
      rank: Yup.string().required("Rank is required"),
      directorRole: Yup.object({
        enabled: Yup.boolean(),
        title: Yup.string().when("enabled", {
          is: true,
          then: (schema) => schema.required("Director role is required"),
          otherwise: (schema) => schema,
        }),
      }),
    }),
    onSubmit: (values) => {
      setMedicCredentialsAction({
        ...values,
        directorRole: {
          enabled: values.directorRole.enabled,
          title: values.directorRole.enabled ? values.directorRole.title : "",
        },
      });
    },
  });

  const isDirectorEnabled = formik.values.directorRole.enabled;
  const directorRoleError = formik.errors.directorRole;
  const directorTitleError =
    directorRoleError && typeof directorRoleError === "object"
      ? directorRoleError.title
      : undefined;

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

      <label
        htmlFor="director-role-checkbox"
        className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-slate-800/60 px-3 py-2 text-sm text-slate-200 transition-all duration-200 hover:border-violet-500/40 hover:bg-violet-950/20"
      >
        <input
          id="director-role-checkbox"
          type="checkbox"
          name="directorRole.enabled"
          checked={isDirectorEnabled}
          onChange={(e) =>
            formik.setFieldValue("directorRole.enabled", e.target.checked)
          }
        />
        Director
      </label>

      {isDirectorEnabled && (
        <>
          <Select
            value={formik.values.directorRole.title}
            onValueChange={(value) =>
              formik.setFieldValue("directorRole.title", value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your director role" />
            </SelectTrigger>
            <SelectContent>
              {directorRoleTitles.map((title) => (
                <SelectItem key={title} value={title}>
                  {title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formik.touched.directorRole?.title && directorTitleError && (
            <span className="text-sm text-red-500">{directorTitleError}</span>
          )}
        </>
      )}

      <Button className="cursor-pointer" variant="outline" type="submit">
        Submit
      </Button>
    </form>
  );
}
