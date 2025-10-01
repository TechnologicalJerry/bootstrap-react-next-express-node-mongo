export default {
  port: 5050,
  databadeUrl:
    "mongodb://localhost:27017/bootstrap-react-next-express-node-mongo",
  jwtSecret: "your-super-secret-jwt-key-change-this-in-production",
  jwtRefreshSecret: "your-super-secret-refresh-key-change-this-in-production",
  jwtExpiresIn: "15m",
  jwtRefreshExpiresIn: "7d",
  corsOrigin: "*",
  nodeEnv: "development"
};
