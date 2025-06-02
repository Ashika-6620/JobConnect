import { AuthGuard } from "@/components/guards";

export default function JobLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  return <AuthGuard redirectTo="/login">{children}</AuthGuard>;
}
