"use client";

import { AlertTriangle } from "lucide-react";
import type { FirebasePublicEnvKey } from "@/firebase/config";
import { APP_NAME } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface FirebaseSetupScreenProps {
  missingVars: FirebasePublicEnvKey[];
}

export function FirebaseSetupScreen({ missingVars }: FirebaseSetupScreenProps) {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-amber-500/30 bg-card/90">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15">
            <AlertTriangle className="h-6 w-6 text-amber-400" aria-hidden />
          </div>
          <CardTitle className="text-xl">{APP_NAME}</CardTitle>
          <CardDescription>
            La aplicación no puede conectarse a Firebase porque faltan variables
            de entorno en este entorno (Vercel o local).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            Configura estas variables en{" "}
            <strong className="text-foreground">
              Vercel → Project → Settings → Environment Variables
            </strong>{" "}
            y vuelve a desplegar:
          </p>
          <ul className="space-y-1 rounded-lg border border-border/60 bg-secondary/40 p-3 font-mono text-xs">
            {missingVars.map((key) => (
              <li key={key}>{key}</li>
            ))}
          </ul>
          <p className="text-muted-foreground">
            Copia los valores desde Firebase Console → Configuración del proyecto →
            Tus apps → SDK web. En local, usa{" "}
            <code className="text-foreground">.env.local</code> basado en{" "}
            <code className="text-foreground">.env.example</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
