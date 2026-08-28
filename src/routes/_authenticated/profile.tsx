import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Car, ChevronRight, LogOut, ScanLine, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AppScreen, Section } from "@/components/layout/AppScreen";
import { PageHeader } from "@/components/navigation/PageHeader";
import { Button } from "@/components/ui/button";
import { SkeletonList } from "@/components/common/States";
import { supabase } from "@/integrations/supabase/client";
import { fetchProfile, fetchReports, fetchVehicles } from "@/lib/queries";
import { inferenceModeLabel } from "@/services/ai/damageDetectionService";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — Car Sense AI" },
      {
        name: "description",
        content:
          "Your Car Sense AI account, garage summary, inspection count and inference configuration.",
      },
      { property: "og:title", content: "Your profile — Car Sense AI" },
      { property: "og:description", content: "Manage your Car Sense AI account and vehicles." },
    ],
  }),
  component: ProfileScreen,
});

function ProfileScreen() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();
  const profile = useQuery({
    queryKey: ["profile", user.id],
    queryFn: () => fetchProfile(user.id),
  });
  const vehicles = useQuery({ queryKey: ["vehicles"], queryFn: fetchVehicles });
  const reports = useQuery({ queryKey: ["reports"], queryFn: () => fetchReports() });

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out.");
    navigate({ to: "/login" });
  }

  return (
    <AppScreen>
      <PageHeader title="Profile" />

      <Section>
        {profile.isLoading ? (
          <SkeletonList rows={1} />
        ) : (
          <div className="rounded-xl border border-border bg-surface p-4 shadow-card">
            <p className="text-base font-semibold">
              {profile.data?.full_name ?? "Car Sense AI driver"}
            </p>
            <p className="text-sm text-muted-foreground">{profile.data?.email ?? user.email}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted px-3 py-2">
                <dt className="text-xs text-muted-foreground">Vehicles</dt>
                <dd className="text-lg font-semibold tabular-nums">
                  {vehicles.data?.length ?? 0}
                </dd>
              </div>
              <div className="rounded-lg bg-muted px-3 py-2">
                <dt className="text-xs text-muted-foreground">Inspections</dt>
                <dd className="text-lg font-semibold tabular-nums">{reports.data?.length ?? 0}</dd>
              </div>
            </dl>
          </div>
        )}
      </Section>

      <Section title="Shortcuts">
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface shadow-card">
          <li>
            <Link to="/vehicles" className="flex items-center gap-3 px-4 py-3.5">
              <Car className="size-4 text-muted-foreground" aria-hidden />
              <span className="flex-1 text-sm font-medium">Manage vehicles</span>
              <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
            </Link>
          </li>
          <li>
            <Link to="/history" className="flex items-center gap-3 px-4 py-3.5">
              <ScanLine className="size-4 text-muted-foreground" aria-hidden />
              <span className="flex-1 text-sm font-medium">Inspection history</span>
              <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
            </Link>
          </li>
        </ul>
      </Section>

      <Section title="Detection engine">
        <div className="flex gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-card">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <div>
            <p className="text-sm font-medium">{inferenceModeLabel()}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Detections are produced through the damage detection service abstraction. Point
              <code className="mx-1">VITE_AI_API_URL</code>
              at your YOLOv8 backend to switch from demo inference to live model predictions.
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <Button variant="outline" className="min-h-12 w-full" onClick={signOut}>
          <LogOut className="size-4" aria-hidden />
          Sign out
        </Button>
      </Section>
    </AppScreen>
  );
}
