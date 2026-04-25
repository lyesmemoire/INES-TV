"use client";

import { Component, ReactNode } from "react";
import { AlertCircle, RotateCw } from "lucide-react";

export class PlayerErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: any) {
    console.error("[PlayerBoundary]", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full aspect-video bg-[#0A0A0A] rounded-[32px] flex flex-col items-center justify-center p-10 text-center border-2 border-dashed border-red-500/20">
          <AlertCircle className="text-red-500 mb-6" size={48} />
          <h3 className="text-white font-black uppercase tracking-tighter text-2xl mb-2">Something went wrong</h3>
          <p className="text-zinc-600 font-bold uppercase tracking-widest text-[9px] mb-8">Fatal Player Error Detected</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="bg-zinc-800 hover:bg-white hover:text-black text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3"
          >
            <RotateCw size={14} /> Reset Player
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
