import jwt from "jsonwebtoken";
import { SecretToken } from "../config.js";
import * as authModel from "../Models/auth.Model.js";


export  const authRequire = async (req, res, next) => {
  try {
   

    // Obtenemos el token
    const { tokenpc } = req.cookies;

    //   Si el TOKEN no es proporcionado o no se ha enviado, validamos y retornamos lo cual corta lo demas
    if (!tokenpc)
      return res.status(401).json({
        type: "error",
        message:
          "Acceso no autorizado. Por favor inicie sesión antes de hacer cualquier petición...",
      });

    // SI el token si fue enviado entonces validamos si nosotros lo creamos y si no ha caducado
    jwt.verify(tokenpc, SecretToken, (error, data) => {
      // Si hay error es porque el token ya vencio o no lo craemos nosotros
      if (error) {
        res.cookie("tokenpc", "", {
          expires: new Date(0),
        });
        return res.status(403).json({
          type: "error",
          message:
            "TKI. Acceso no autorizado. Por favor inicie sesión antes de hacer cualquier petición...",
        });
      }

      //SI llegamos hasta aqui es porque el tocken en enviado y tabmien es valido, entonces procedemos a insertar los datos en el requerir

      //Insertamos los datos del PAYLOAD en el req para que este disponible para la funcion que se ejecute despues
      req.IDEstudiante = data.IDEstudiante;
      req.IDRol = data.IDRol;
      req.Nombre = data.Nombre;









      next();
    });
  } catch (error) {
    return res.status(500).json({ type: "error", message: error.message });
  }
};
