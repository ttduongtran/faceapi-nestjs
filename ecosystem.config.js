module.exports = {
  apps: [
    {
      name: 'face-recognition-api',
      script: 'dist/main.js',
      env_production: {
        NODE_ENV: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
      },
      cwd: './',
      kill_timeout: 3000,
      restart_delay: 3000,
      watch: true,
    },
  ],
};
