import app from "./app.js";
import { SERVER_URL,PORT } from "./config.js";
import { config } from 'dotenv';
config(); // Cargará las variables de entorno del archivo .env en process.env


async function main() {
  try {
    console.log(PORT);
    app.listen(PORT, "localhost");
    console.log(`Listening on port ${SERVER_URL}`);
    console.log(`Environment: ${process.env.ENTORNO}`);
  } catch (error) {
    console.error(error);
  }
}

main();
