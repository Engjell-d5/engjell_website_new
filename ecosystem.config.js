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
      autorestart: true,
      max_restarts: 5,
      restart_delay: 5000,
    },
  ],
};

