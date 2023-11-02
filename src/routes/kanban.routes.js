import { Router } from "express";
import * as kanbanControllers from "../Controllers/kanban.Controllers.js";
import {authRequire} from "../middlewares/validateToken.js";


const prefijoDeApi = "/api";
const routerKanban = Router();

//EndPoints
routerKanban.get(
  prefijoDeApi + "/getListasTableros", authRequire, 
  kanbanControllers.getListasTableros
);
routerKanban.get(
  prefijoDeApi + "/getTicketsAsignados",  authRequire,
  kanbanControllers.getTicketsAsignados
);
routerKanban.patch(
  prefijoDeApi + "/patchMoverTicket", authRequire,
  kanbanControllers.patchMoverTicket
);
routerKanban.get(
  prefijoDeApi + "/getColaboradoresAgencia", authRequire, 
  kanbanControllers.getColaboradoresAgencia
);
routerKanban.patch(
  prefijoDeApi + "/patchActualizarTicket", authRequire, 
  kanbanControllers.patchActualizarTicket
);
routerKanban.patch(
  prefijoDeApi + "/patchCancelarTicket",  authRequire, 
  kanbanControllers.patchCancelarTicket
);
routerKanban.patch(
  prefijoDeApi + "/patchTrasladarTicket", authRequire, 
  kanbanControllers.PatchTrasladarTicket
);

export default routerKanban;
