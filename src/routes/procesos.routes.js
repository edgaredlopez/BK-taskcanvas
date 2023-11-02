import { Router } from "express";
import * as procesoController from "../Controllers/procesos.Controllers.js";
import { authRequire } from "../middlewares/validateToken.js";

const prefijoDeApi = "/api";
const routerProceso = Router();

//EndPoints
routerProceso.get(
  prefijoDeApi + "/getServiceArea/:IDArea",
  authRequire,
  procesoController.getServiceArea
);
routerProceso.get(
  prefijoDeApi + "/getDataCreacionTicket",
  authRequire,
  procesoController.getDataCreacionTicket
);
routerProceso.post(
  prefijoDeApi + "/generarTicket",
  authRequire,
  procesoController.postGenerarTicket
);
routerProceso.get(
  prefijoDeApi + "/getDatosCreacionColaborador",
  authRequire,
  procesoController.getDatosCreacionColaborador
);

export default routerProceso;
