export type StreamData = {
  url: string;
  type: string;
};

export type PlayerState = 
  | { status: "idle" }
  | { status: "loading" }
  | { status: "playing"; stream: StreamData }
  | { status: "degraded"; reason: string }
  | { status: "offline"; retryCount: number };
