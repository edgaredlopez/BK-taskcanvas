import { Router } from "express";
import * as authController from "../Controllers/auth.controllers.js";
import {authRequire} from "../middlewares/validateToken.js";
const prefijoDeApi = "/api";
const routerAuth = Router();

//EndPoints
routerAuth.post(prefijoDeApi + "/login", authController.login);
routerAuth.get(prefijoDeApi + "/verificarToken",  authController.verificarToken);
routerAuth.post(prefijoDeApi + "/changePassword", authRequire, authController.changePassword);
routerAuth.get(prefijoDeApi + "/logout",  authController.logout);
routerAuth.post(prefijoDeApi + "/registro", authRequire,  authController.registro);
routerAuth.get(
  prefijoDeApi + "/getCbyUser/:Usuario", authRequire,
  authController.getCbyUser
);
routerAuth.get(
  prefijoDeApi + "/getPerfil", authRequire,
  authController.getPerfilController
);
routerAuth.patch(prefijoDeApi + "/modificarColaborador", authRequire, authController.ModificarColaborador);

// routerAuth.put(prefijoDeApi + "/tasks/:id", authRequire, (req, res) => {
//   console.log("hola");

// });

export default routerAuth;
