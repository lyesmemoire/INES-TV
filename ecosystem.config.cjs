module.exports = {
  apps: [
    {
      name: "goala",
      script: ".next/standalone/server.js",
      
      /* 
         🚀 SCALING STRATEGY:
         - 8GB RAM / 4 Cores: instances: "max", max_memory_restart: "1G"
         - 4GB RAM / 2 Cores: instances: 2,     max_memory_restart: "700M"
         - 2GB RAM / 1 Core:  instances: 1,     max_memory_restart: "500M"
      */
      instances: "max",
      exec_mode: "cluster",
      max_memory_restart: "1G",
      
      // 🛡️ Production Hardening
      autorestart: true,
      watch: false,
      restart_delay: 5000,
      max_restarts: 10,

      // 📝 Centralized Logging
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,

      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0"
      }
    }
  ]
}
