import type { Metadata } from "next";
import { LoginForm } from "@/app/admin/login-form";

export const metadata: Metadata = {
  title: "Admin Access",
};

export default function AdminLoginPage() {
  return (
    <div className="bg-hud-grid flex min-h-screen items-center justify-center px-4 py-16">
      <LoginForm />
    </div>
  );
}
