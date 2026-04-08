"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await signIn("credentials", {
          email: values.email,
          password: values.password,
          redirect: false,
        });

        if (result?.error) {
          setError("Invalid email or password. Please check your credentials.");
        } else {
          // Success! Redirect manually to avoid "double login page" issues
          window.location.href = "/";
        }
      } catch (e: any) {
        setError("An unexpected error occurred. Please try again.");
      }
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 shadow-2xl border-none ring-1 ring-slate-200">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-black tracking-tight text-slate-900">Welcome back</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Access your StudyCubs Dashboard
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-center gap-2 text-red-700 text-xs font-medium animate-in fade-in slide-in-from-top-1">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="email" className="text-xs font-bold text-slate-700">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@studycubs.com"
                  className="h-11 bg-slate-50 border-slate-200 focus:ring-violet-500/20"
                  {...register("email")}
                  disabled={isPending}
                />
                {errors.email && (
                  <p className="text-[10px] font-bold text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password" title="Enter your password" data-testid="password-label" className="text-xs font-bold text-slate-700">Password</Label>
                  <a
                    href="#"
                    className="ml-auto text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors"
                  >
                    Forgot?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  className="h-11 bg-slate-50 border-slate-200 focus:ring-violet-500/20"
                  {...register("password")}
                  disabled={isPending}
                />
                {errors.password && (
                  <p className="text-[10px] font-bold text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-lg shadow-slate-900/10" disabled={isPending}>
                {isPending ? "Logging in..." : "Continue to Dashboard"}
              </Button>
            </div>
          </form>
          <div className="relative hidden bg-slate-100 md:block">
            <img
              src="/login-bg.jpg"
              alt="StudyCubs Dashboard Decoration"
              className="absolute inset-0 h-full w-full object-cover grayscale opacity-90 transition-all hover:grayscale-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent pointer-events-none" />
          </div>
        </CardContent>
      </Card>
      <div className="text-center text-[10px] font-medium text-slate-400">
        Secure login powered by NextAuth. &copy; 2024 StudyCubs LMS.
      </div>
    </div>
  );
}
