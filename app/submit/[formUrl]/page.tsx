import { GetFormContentByUrl } from "@/actions/form";
import { FormElementInstance } from "@/components/FormElements";
import FormSubmitUrl from "@/components/FormSubmitUrl";
import React from "react";

async function SubmitPage({
  params,
}: {
  params: {
    formUrl: string;
  };
}) {
  const form = await GetFormContentByUrl(params.formUrl);
  if (!form) throw new Error("form not found");

  const formContent = form.content as FormElementInstance[];

  return <FormSubmitUrl formUrl={params.formUrl} content={formContent} />;
}

export default SubmitPage;
