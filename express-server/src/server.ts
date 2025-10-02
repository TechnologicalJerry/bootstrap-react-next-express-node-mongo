import config from "config";
import connect from "./utilitys/connectDb";
import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const PORT = config.get<number>("port");

app.listen(PORT, async () => {
  console.log(`Server is running on PORT = ${PORT}`);
  console.log(`Environment: ${config.get<string>("nodeEnv")}`);
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
  
  await connect();
});
