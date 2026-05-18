"use client";

import { AlertTriangle, ExternalLink } from "lucide-react";
import {
  extractFirestoreIndexUrl,
  getFirestoreErrorMessage,
  isFirestoreIndexError,
} from "@/lib/firestore-errors";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface FirestoreErrorPanelProps {
  error: unknown;
  title?: string;
}

export function FirestoreErrorPanel({
  error,
  title = "No se pudieron cargar los datos",
}: FirestoreErrorPanelProps) {
  const message = getFirestoreErrorMessage(error);
  const indexUrl = extractFirestoreIndexUrl(error);
  const isIndex = isFirestoreIndexError(error);

  return (
    <Card className="border-destructive/30 bg-destructive/5" role="alert">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" aria-hidden />
          {title}
        </CardTitle>
        <CardDescription className="text-left">{message}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isIndex ? (
          <Card className="border-border/60 bg-background/50 shadow-none">
            <CardContent className="space-y-2 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Desplegar índices (una vez)</p>
              <pre className="overflow-x-auto rounded bg-secondary/60 p-2 font-mono">
                firebase deploy --only firestore:indexes
              </pre>
              <p>
                Requiere Firebase CLI (
                <code className="text-foreground">firebase use</code>). El índice puede
                tardar unos minutos en estado Enabled.
              </p>
            </CardContent>
          </Card>
        ) : null}
        {indexUrl ? (
          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
            <a href={indexUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Crear índice en Firebase Console
            </a>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
