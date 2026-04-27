"use client"

import { Component, ReactNode } from "react"

type Props = { children: ReactNode }
type State = { hasError: boolean }

export class PWAErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error("PWA Error:", error)
  }

  render() {
    if (this.state.hasError) {
      return null // Fail silently for PWA
    }
    return this.props.children
  }
}
