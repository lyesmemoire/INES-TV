import { Worker, MessageChannel } from "worker_threads";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CPU_COUNT = os.cpus().length;
const workers: Worker[] = [];
let nextWorkerIdx = 0;

/**
 * 🏊 GOOGLE-GRADE WORKER POOL
 * Manages a pool of background workers for zero-blocking compute.
 */
export function initWorkerPool() {
  if (workers.length > 0) return;

  console.log(`🧵 [WorkerPool] Initializing ${CPU_COUNT} threads...`);
  
  for (let i = 0; i < CPU_COUNT; i++) {
    const worker = new Worker(path.join(__dirname, "worker.js"));
    
    worker.on("error", (err) => console.error("[Worker Error]", err));
    worker.on("exit", (code) => {
        if (code !== 0) console.error(`Worker stopped with exit code ${code}`);
    });
    
    workers.push(worker);
  }
}

export function dispatchTask(data: any): Promise<any> {
  return new Promise((resolve) => {
    const worker = workers[nextWorkerIdx++ % workers.length];
    
    const channel = new MessageChannel();
    channel.port2.on("message", (res) => resolve(res));
    
    worker.postMessage(data, [channel.port1]);
  });
}
