"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function RegistrerenPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Naam is verplicht");
      return;
    }
    if (!email.trim()) {
      setError("E-mailadres is verplicht");
      return;
    }
    if (!companyName.trim()) {
      setError("Bedrijfsnaam is verplicht");
      return;
    }
    if (!password) {
      setError("Wachtwoord is verplicht");
      return;
    }
    if (password.length < 6) {
      setError("Wachtwoord moet minimaal 6 tekens bevatten");
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              company_name: companyName,
            },
          },
        });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          setError("Er bestaat al een account met dit e-mailadres");
        } else {
          setError("Er ging iets mis. Probeer het opnieuw.");
        }
        return;
      }

      // If email confirmation is required, session will be null
      if (!signUpData.session) {
        setError("Controleer je e-mail om je account te bevestigen.");
        return;
      }

      const user = signUpData.user;
      if (!user) {
        setError("Er ging iets mis. Probeer het opnieuw.");
        return;
      }

      // Create organization
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .insert({ name: companyName })
        .select()
        .single();

      if (orgError) {
        setError("Er ging iets mis. Probeer het opnieuw.");
        return;
      }

      // Link profile to organization (profile created by handle_new_user trigger)
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ organization_id: org.id })
        .eq("id", user.id);

      if (profileError) {
        // Retry once in case the trigger hasn't fired yet
        await new Promise((resolve) => setTimeout(resolve, 500));
        await supabase
          .from("profiles")
          .update({ organization_id: org.id })
          .eq("id", user.id);
      }

      router.push("/dashboard");
    } catch {
      setError("Er ging iets mis. Probeer het opnieuw.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card
      className="border-0"
      style={{ boxShadow: "var(--shadow-elevated)" }}
    >
      <CardHeader className="text-center">
        <CardTitle
          className="text-2xl font-bold"
          style={{ color: "var(--ink)" }}
        >
          Account aanmaken
        </CardTitle>
        <CardDescription style={{ color: "var(--ink-secondary)" }}>
          Start met het genereren van woningadvertenties
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Volledige naam</Label>
            <Input
              id="name"
              type="text"
              placeholder="Jan de Vries"
              autoComplete="name"
              className="bg-[var(--surface-2)]"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">E-mailadres</Label>
            <Input
              id="email"
              type="email"
              placeholder="jan@makelaardij.nl"
              autoComplete="email"
              className="bg-[var(--surface-2)]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="company">Bedrijfsnaam</Label>
            <Input
              id="company"
              type="text"
              placeholder="De Vries Makelaardij"
              autoComplete="organization"
              className="bg-[var(--surface-2)]"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Wachtwoord</Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              autoComplete="new-password"
              className="bg-[var(--surface-2)]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p className="text-sm" style={{ color: "var(--destructive)" }}>
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Account aanmaken..." : "Account aanmaken"}
          </Button>
        </form>
        <p
          className="mt-6 text-center text-sm"
          style={{ color: "var(--ink-secondary)" }}
        >
          Al een account?{" "}
          <Link
            href="/login"
            className="font-medium"
            style={{ color: "var(--brand)" }}
          >
            Inloggen
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
