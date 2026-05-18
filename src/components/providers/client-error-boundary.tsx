"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message?: string;
}

export class ClientErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ClientErrorBoundary]", error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, message: undefined });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-dvh items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-destructive/30 bg-card/90">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/15">
              <AlertCircle className="h-6 w-6 text-destructive" aria-hidden />
            </div>
            <CardTitle className="text-xl">Algo salió mal</CardTitle>
            <CardDescription>
              La aplicación encontró un error inesperado. Puedes recargar la página
              o volver al inicio.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {this.state.message && (
              <p className="rounded-lg border border-border/60 bg-secondary/40 p-3 font-mono text-xs text-muted-foreground">
                {this.state.message}
              </p>
            )}
            <Button className="w-full" onClick={this.handleRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Recargar aplicación
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
}
