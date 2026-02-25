"use client";

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

export default function RegistrerenPage() {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    router.push("/dashboard");
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
            />
          </div>
          <Button type="submit" className="w-full">
            Account aanmaken
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
