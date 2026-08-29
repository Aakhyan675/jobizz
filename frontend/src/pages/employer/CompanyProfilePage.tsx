import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { companiesApi, profilesApi } from "../../services/endpoints";
import { getApiError } from "../../services/api";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input, Select, TextArea } from "../../components/Input";
import { Spinner } from "../../components/States";

export function CompanyProfilePage() {
  const qc = useQueryClient();
  const { data: employer, isLoading } = useQuery({ queryKey: ["employer-profile"], queryFn: profilesApi.employer });
  const companyId = employer?.company_id;
  const { data: company } = useQuery({
    queryKey: ["company", companyId],
    queryFn: () => companiesApi.get(companyId!),
    enabled: Boolean(companyId),
  });
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (company) {
      reset({
        name: company.name,
        website: company.website,
        industry: company.industry,
        size: company.size,
        location: company.location,
        description: company.description,
        job_title: employer?.job_title,
      });
    } else if (employer) {
      reset({ job_title: employer.job_title });
    }
  }, [company, employer, reset]);

  const save = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      const form = new FormData();
      form.append("name", values.name || "");
      form.append("website", values.website || "");
      form.append("industry", values.industry || "");
      form.append("size", values.size || "");
      form.append("location", values.location || "");
      form.append("description", values.description || "");
      const file = (document.getElementById("logo") as HTMLInputElement | null)?.files?.[0];
      if (file) form.append("logo", file);
      const saved = companyId ? await companiesApi.update(companyId, form) : await companiesApi.create(form);
      await profilesApi.updateEmployer({ company: saved.id, job_title: values.job_title });
    },
    onSuccess: () => {
      toast.success("Company profile saved");
      qc.invalidateQueries({ queryKey: ["employer-profile"] });
      qc.invalidateQueries({ queryKey: ["company"] });
    },
    onError: (e) => toast.error(getApiError(e)),
  });

  if (isLoading) return <Spinner />;

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold">Company profile</h1>
      <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit((v) => save.mutate(v as Record<string, string>))}>
        <div className="sm:col-span-2">
          <Input label="Company name" {...register("name", { required: true })} />
        </div>
        <Input label="Website" {...register("website")} />
        <Input label="Industry" {...register("industry")} />
        <Select label="Company size" {...register("size")}>
          <option value="">Select</option>
          <option value="1-10">1-10</option>
          <option value="11-50">11-50</option>
          <option value="51-200">51-200</option>
          <option value="201-500">201-500</option>
          <option value="500+">500+</option>
        </Select>
        <Input label="Location" {...register("location")} />
        <Input label="Your job title" {...register("job_title")} />
        <div className="sm:col-span-2">
          <TextArea label="Description" rows={5} {...register("description")} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">Logo</label>
          <input id="logo" type="file" accept="image/*" className="mt-1 text-sm" />
        </div>
        <Button type="submit" disabled={save.isPending}>
          Save
        </Button>
      </form>
    </Card>
  );
}
