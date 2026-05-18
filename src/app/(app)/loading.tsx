import { Loader2 } from "lucide-react";

export default function AppLoading() {
  return (
    <div className="flex min-h-[50dvh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Cargando" />
    </div>
  );
}
