import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { jobsApi, profilesApi } from "../../services/endpoints";
import { getApiError } from "../../services/api";
import { useCategories } from "../../hooks/useJobs";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input, Select, TextArea } from "../../components/Input";
import { Spinner } from "../../components/States";

export function JobFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: categories } = useCategories();
  const { data: existing, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: () => jobsApi.get(id!),
    enabled: isEdit,
  });
  const { data: employer } = useQuery({ queryKey: ["employer-profile"], queryFn: profilesApi.employer });
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (existing) {
      reset({
        title: existing.title,
        category: existing.category ?? "",
        location: existing.location,
        job_type: existing.job_type,
        experience_level: existing.experience_level,
        description: existing.description,
        requirements: existing.requirements,
        benefits: existing.benefits,
        salary_min: existing.salary_min ?? "",
        salary_max: existing.salary_max ?? "",
        is_published: existing.is_published ? "true" : "false",
      });
    }
  }, [existing, reset]);

  const save = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      const payload = {
        title: values.title,
        category: values.category ? Number(values.category) : null,
        location: values.location,
        job_type: values.job_type,
        experience_level: values.experience_level,
        description: values.description,
        requirements: values.requirements,
        benefits: values.benefits,
        salary_min: values.salary_min ? Number(values.salary_min) : null,
        salary_max: values.salary_max ? Number(values.salary_max) : null,
        is_published: values.is_published === "true",
        company: employer?.company_id,
      };
      if (isEdit) return jobsApi.update(Number(id), payload);
      return jobsApi.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? "Job updated" : "Job posted");
      qc.invalidateQueries({ queryKey: ["my-jobs"] });
      navigate("/employer/jobs");
    },
    onError: (e) => toast.error(getApiError(e, "Could not save job")),
  });

  if (isEdit && isLoading) return <Spinner />;
  if (!employer?.company_id) {
    return (
      <Card className="p-6">
        <h1 className="text-xl font-bold">Create a company profile first</h1>
        <p className="mt-2 text-sm text-slate-500">You need a company before posting jobs.</p>
        <Button className="mt-4" onClick={() => navigate("/employer/company")}>
          Company profile
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold">{isEdit ? "Edit job" : "Post a job"}</h1>
      <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit((v) => save.mutate(v as Record<string, string>))}>
        <div className="sm:col-span-2">
          <Input label="Job title" {...register("title", { required: true })} />
        </div>
        <Select label="Category" {...register("category")}>
          <option value="">Select</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Input label="Location" {...register("location", { required: true })} />
        <Select label="Job type" {...register("job_type")}>
          <option value="full_time">Full-time</option>
          <option value="part_time">Part-time</option>
          <option value="internship">Internship</option>
          <option value="remote">Remote</option>
          <option value="contract">Contract</option>
        </Select>
        <Select label="Experience" {...register("experience_level")}>
          <option value="intern">Intern</option>
          <option value="entry">Entry</option>
          <option value="mid">Mid</option>
          <option value="senior">Senior</option>
        </Select>
        <Input label="Salary min" type="number" {...register("salary_min")} />
        <Input label="Salary max" type="number" {...register("salary_max")} />
        <div className="sm:col-span-2">
          <TextArea label="Description" rows={6} {...register("description", { required: true })} />
        </div>
        <div className="sm:col-span-2">
          <TextArea label="Requirements" rows={4} {...register("requirements")} />
        </div>
        <div className="sm:col-span-2">
          <TextArea label="Benefits" rows={3} {...register("benefits")} />
        </div>
        <Select label="Visibility" {...register("is_published")}>
          <option value="true">Published</option>
          <option value="false">Draft / unpublished</option>
        </Select>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={save.isPending}>
            {isEdit ? "Save changes" : "Create job"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
