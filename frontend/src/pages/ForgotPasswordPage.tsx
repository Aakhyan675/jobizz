import { useState } from "react";
import { toast } from "sonner";
import { authApi } from "../services/endpoints";
import { getApiError } from "../services/api";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [debugUrl, setDebugUrl] = useState("");

  return (
    <div className="container-page flex justify-center py-16">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold">Reset password</h1>
        <p className="mt-1 text-sm text-slate-500">We’ll send a reset link if the email exists. In development it is also printed in the API response.</p>
        <form
          className="mt-6 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const data = await authApi.passwordReset(email);
              toast.success("If the account exists, a reset email was sent.");
              if (data.debug_reset_url) setDebugUrl(data.debug_reset_url);
            } catch (err) {
              toast.error(getApiError(err));
            }
          }}
        >
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button className="w-full" type="submit">
            Send reset link
          </Button>
        </form>
        {debugUrl && (
          <p className="mt-4 break-all text-xs text-slate-500">
            Debug link:{" "}
            <a className="text-brand-700" href={debugUrl}>
              {debugUrl}
            </a>
          </p>
        )}
      </Card>
    </div>
  );
}
