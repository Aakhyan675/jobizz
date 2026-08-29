import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { authApi } from "../services/endpoints";
import { getApiError } from "../services/api";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<{ new_password: string }>();

  return (
    <div className="container-page flex justify-center py-16">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold">Choose a new password</h1>
        <form
          className="mt-6 space-y-4"
          onSubmit={handleSubmit(async (values) => {
            try {
              await authApi.passwordResetConfirm({
                uid: params.get("uid") || "",
                token: params.get("token") || "",
                new_password: values.new_password,
              });
              toast.success("Password updated. Please log in.");
              navigate("/login");
            } catch (e) {
              toast.error(getApiError(e, "Reset link is invalid or expired"));
            }
          })}
        >
          <Input label="New password" type="password" {...register("new_password", { required: true, minLength: 8 })} />
          <Button className="w-full" type="submit">
            Update password
          </Button>
        </form>
      </Card>
    </div>
  );
}
