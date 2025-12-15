module.exports = {
  apps: [
    {
      name: 'engjell-website',
      script: 'npm',
      args: 'start',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        PORT: 7776,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 7776,
      },
      autorestart: true,
      max_restarts: 5,
      restart_delay: 5000,
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};

