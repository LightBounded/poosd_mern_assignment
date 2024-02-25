"use client";

import { user } from "@/validators";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignUp() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<z.infer<typeof user>>({
    resolver: zodResolver(user),
  });

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      router.push("/");
    }
  });

  const onSubmit: SubmitHandler<z.infer<typeof user>> = async (data) => {
    const response = await fetch("/api/sign-up", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      router.push("/sign-in");
    } else {
      const json = await response.json();
      setError(json.message);
    }
  };

  return (
    <main className="flex min-h-screen flex-col justify-between items-center p-24">
      <div className="flex-1 grid place-content-center">
        <h1 className="text-2xl font-semibold mb-1 text-center">
          COP 4331 MERN Stack Demo
        </h1>
        <p className="text-center mb-4">Sign up below</p>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
          {error && <span className="text-red-500 text-center">{error}</span>}
          <div className="flex flex-col gap-1">
            <label htmlFor="username">Username</label>
            <input
              {...register("username")}
              id="username"
              className="bg-slate-900 border-slate-800 border rounded px-4 py-2 outline-none focus-within:ring-2 focus-within:ring-slate-500"
              placeholder="username"
            />
            {errors.username && (
              <span className="text-red-500 text-sm">
                {errors.username.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password">Password</label>
            <input
              {...register("password")}
              id="password"
              className="bg-slate-900 border-slate-800 border rounded px-4 py-2 outline-none focus-within:ring-2 focus-within:ring-slate-500"
              type="password"
              placeholder="password"
            />
            {errors.password && (
              <span className="text-red-500 text-sm">
                {errors.password.message}
              </span>
            )}
          </div>
          <button
            disabled={isSubmitting}
            className="bg-slate-800 px-4 py-2 rounded-md mt-2 font-semibold hover:bg-slate-700 transition-colors focus-within:ring-2 focus-within:ring-slate-500 focus-within:outline-none"
            type="submit"
          >
            Submit
          </button>
          <p className="text-center">
            Already have an account?{" "}
            <a className="text-blue-500 underline" href="/sign-in">
              Sign in
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
