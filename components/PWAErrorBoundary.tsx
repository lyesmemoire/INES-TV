"use client";

import React, { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class PWAErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("PWAErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return null; // Silently swallow PWA errors to avoid crashing the whole app
    }
    return this.props.children;
  }
}
