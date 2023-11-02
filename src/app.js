import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { config } from 'dotenv';
config(); // Cargará las variables de entorno del archivo .env en process.env

import authRutas from "./routes/auth.routes.js";
import routerProceso from "./routes/procesos.routes.js";
import kanbanRutas from "./routes/kanban.routes.js";
import routerReportes from "./routes/reportes.routes.js";
import { FRONTEND_URL } from "./config.js";

const app = express();
app.use(morgan("combined"));
console.log(FRONTEND_URL);

const corsOptions = {
    credentials: true,
    origin: FRONTEND_URL, // Elimina el '/creditos' del origen
};

app.use(cors(corsOptions));

app.use(express.json());



app.use(cookieParser());

//Usamos las rutas
app.use(authRutas);
app.use(routerProceso);
app.use(kanbanRutas);
app.use(routerReportes);

app.use(express.static("public"));

if (process.env.ENTORNO === "production") {
  const path = await import("path");
  app.use(express.static("./src/client/dist"));
console.log("Edgarrrrrrrrrrrrr");
  app.get("*", (req, res) => {
    console.log(path.resolve("./src/client", "dist", "index.html"));
    res.sendFile(path.resolve("./src/client", "dist", "index.html"));
  });
}


export default app;
