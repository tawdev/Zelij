module.exports = {
  apps: [
    {
      name: 'mol-frontend',
      script: 'node_modules/.bin/next',
      args: 'start -p 3025',
      cwd: './frontend',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'mol-backend',
      script: 'dist/src/main.js',
      cwd: './backend',
      env: {
        NODE_ENV: 'production',
        PORT: 3024,
      },
    },
  ],
};
