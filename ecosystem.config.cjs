module.exports = {
  apps: [
    {
      name: "aurora",
      script: "src/index.js",
      watch: false,
      node_args: [],
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
