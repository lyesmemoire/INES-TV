module.exports = {
  apps: [
    {
      name: "streamperf-api",
      script: "cluster.ts", // We use cluster.ts directly with tsx
      interpreter: "node",
      interpreter_args: "--import tsx",
      instances: "max",
      exec_mode: "cluster",
      
      // 🔥 Auto-Recovery Hardening
      max_memory_restart: "300M",
      restart_delay: 5000,
      max_restarts: 10,

      // 📝 Centralized Logging
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,

      env: {
        NODE_ENV: "production",
        LOG_LEVEL: "warn",
        PORT: 3000
      }
    }
  ]
}
