import { AuthSessionGate } from "@/components/auth/auth-session-gate";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthSessionGate mode="guest-only" redirectTo="/timeline">
      <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </AuthSessionGate>
  );
}
