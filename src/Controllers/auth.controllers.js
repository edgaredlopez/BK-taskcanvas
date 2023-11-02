import * as authModel from "../Models/auth.Model.js";
import { createAccessToken } from "./jwt.js";
import multer from "multer";
import { fileURLToPath } from "url";
import { dirname, join, extname } from "path";
import jwt from "jsonwebtoken";
import { SecretToken } from "../config.js";
import { SERVER_URL } from "../config.js";

import { config } from "dotenv";
config(); // Cargará las variables de entorno del archivo .env en process.env

// Obtener la dirección actual
const __dirname = dirname(fileURLToPath(import.meta.url));

// Creamos una instancia de multer.diskStorage para definir cómo se almacenarán los archivos recibidos
const storage = multer.diskStorage({
  // La función "destination" se utiliza para especificar la carpeta de destino donde se guardarán los archivos
  destination: function (req, file, cb) {
    cb(null, join(__dirname, "../../public")); // Se especifica la carpeta de destino como "__dirname/../public"
  },
  // La función "filename" se utiliza para especificar el nombre del archivo que se guardará
  filename: function (req, file, cb) {
    const extension = extname(file.originalname); // Se obtiene la extensión del archivo original
    const fileName = `${file.originalname}`; // Se define el nombre del archivo como el nombre original
    cb(null, fileName); // Se pasa el nombre del archivo al callback
  },
});

// Creamos una instancia de multer pasándole el objeto de configuración "storage" que creamos anteriormente
const upload = multer({ storage });

// Para el registro
export const registro = async (req, res) => {
  try {
    upload.single("Fotografia")(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        // Error de Multer al subir el archivo
        console.log(err);
        return res.status(500).json({
          type: "error",
          message: "Error al subir la imagen",
          error: err.message,
        });
      } else if (err) {
        // Otro tipo de error
        console.log(err);
        return res.status(500).json({
          type: "error",
          message: "Ocurrió un error al procesar la imagen",
          error: err.message,
        });
      }

      // Si todos los campos están llenos, continuamos con el registro
      const {
        NombreCompleto,
        Puesto,
        SiglasPuesto,
        // DPI,
        Usuario,
        Password,
        IDArea,
        IDRol,
        IDAgencia,
      } = req.body; // Obtenemos los datos que nos llegan en el body de la petición

      let DataFileGuardado = req.file.originalname;

      // Solicitamos que se registre el usuario en la base de datos
      const resultadoConsulta = await authModel.registroModel(
        NombreCompleto,
        "adsf",
        Puesto,
        SiglasPuesto,
        // DPI,
        Usuario,
        Password,
        IDArea,
        IDRol,
        IDAgencia
      );

      // Verificamos si el resultado de la consulta es de tipo success
      if (resultadoConsulta.type == "success") {
        return res.json({
          type: resultadoConsulta.type, // success
          message: resultadoConsulta.message, // Usuario encontrado
        });
      } else {
        // Si el resultado de la consulta no es de tipo success, retornamos un mensaje de error
        return res.json({
          type: resultadoConsulta.type,
          message: resultadoConsulta.message,
          error: resultadoConsulta.error,
        });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      type: "error",
      message:
        "Ocurrió un error al validar su consulta con los datos del colaborador",
      error: error.message,
    });
  }
};

//Para el login
export const login = async (req, res) => {
  try {
    // console.log(req);
    if (!req.body.Usuario || !req.body.Password) {
      return res.json({
        type: "error",
        message:
          "Todos los campos son requeridos en el body, por favor verifique que esten llenos y vuelva a intentarlo...",
      });
    } else {
      const { Usuario, Password } = req.body;

      //Consultamos el usuario recibido en la base de datos
      const resuladoConsulta = await authModel.loginModel(Usuario.replace(" ", ""), Password.replace(" ", ""));

      // Verificamos si el restulataod de la consulta es de tipo success
      if (resuladoConsulta.type == "success") {
        //Si el usuario existe, creamos el token

        const payload = {
          IDEstudiante: resuladoConsulta.data.IDEstudiante,
          IDRol: resuladoConsulta.data.IDRol,
          Nombre: resuladoConsulta.data.Nombre
        };

        const token = await createAccessToken(payload);

        console.log(
          "_____________________________________________________________________"
        );

        //Obtener fecha y hora en formato AÑOS-MES-DIA HORA:MINUTOS:SEGUNDOS
        let fecha = new Date();
        //Aplicar formato AÑOS-MES-DIA HORA:MINUTOS:SEGUNDOS
        let fechaActualFormato = new Date();
        fechaActualFormato = fechaActualFormato.toLocaleString();

        console.log("Usuario: " + resuladoConsulta.data.Nombre);
        console.log("Fecha y Hora: " + fechaActualFormato);

        if (process.env.ENTORNO === "production") {
          console.log(
            "______________Generación de token en modo PRODUCCION_________________"
          );

          // Enviamos el tocken en la COOKIE
          res.cookie("tokenpc", token, {
            sameSite: "none",
            secure: true,
          });
        } else {
          console.log(
            "______________Generación de token en modo DESARROLLO_________________"
          );
          // Enviamos el tocken en la COOKIE
          res.cookie("tokenpc", token, {
            // httpOnly: process.env.NODE_ENV !== "development",
            httpOnly: false,
            secure: true,
            sameSite: "none",
          });
        }

        // Respondemos un json al usuario
        return res.json({
          type: resuladoConsulta.type,
          message: resuladoConsulta.message,
          data: {
            Nombre: resuladoConsulta.data.Nombre,
            IDRol: resuladoConsulta.data.IDRol,
            IDEstudiante: resuladoConsulta.data.IDEstudiante,
          },
        });
      } else {
        //Si el resultado de la consulta no es de tipo success, retornamos un mensaje de error
        return res.json({
          type: resuladoConsulta.type,
          message: resuladoConsulta.message,
          error: resuladoConsulta.error,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      type: "error",
      message:
        "Ocurrió un error al validar su consulta con los datos del colaborador enviado",
      error: error.message,
    });
  }
};

//Para el login
export const verificarToken = async (req, res) => {
  try {
    const { tokenpc } = req.cookies;

    if (!tokenpc) {
      res.cookie("tokenpc", "", {
        expires: new Date(0),
      });

      return res.status(401).json({
        type: "error",
        message: "Usuario no autorizado, no se le ha designado un token...",
      });
    }

    jwt.verify(tokenpc, SecretToken, async (error, user) => {
      if (error)
        return res.status(401).json({
          type: "error",
          message: "Usuario no autorizado, token invalido...",
        });

      const resuladoConsulta = await authModel.comprobarExistenciaDeUsuario(
        user.IDColaborador
      );

      console.log("EDGAR------Recargo de la pagina: Verificacion de Tocken");

      // Verificamos si el restulataod de la consulta es de tipo success
      if (
        resuladoConsulta.type == "success" &&
        resuladoConsulta.data[0].Estado == 1
      ) {
        return res.json({
          type: "success",
          message: "El usuario sí esta autorizado...",
          data: user,
        });
      } else {
        res.cookie("tokenpc", "", {
          expires: new Date(0),
        });

        return res
          .status(401)
          .json({ type: "danger", message: "Usuario no autorizado..." });
      }
    });
  } catch (error) {
    res.cookie("tokenpc", "", {
      expires: new Date(0),
    });

    return res.status(500).json({
      type: "error",
      message:
        "Ocurrió un error al comprobar si el usuario está o no autorizado...",
      error: error.message,
    });
  }
};

//Para cambiar la contraseña
export const changePassword = async (req, res) => {
  try {
    if (!req.body.AntiguoPassword || !req.body.NuevoPassword) {
      return res.json({
        type: "error",
        message:
          "Debe enviar tanto la contraseña antigua como la nueva, de lo contrario no podemos proceder con su peticion...",
      });
    } else {
      const { AntiguoPassword, NuevoPassword } = req.body;
      const IDColaborador = req.IDColaborador;

      //Consultamos el usuario recibido en la base de datos
      const resuladoConsulta = await authModel.comprobacionParaCambioDePassword(
        IDColaborador,
        AntiguoPassword
      );

      // Verificamos si la contraseña antigua es valida
      if (resuladoConsulta.type == "success") {
        // Procedemos a actualizar la contraseña
        const resultadoCambio = await authModel.cambiarPassword(
          IDColaborador,
          NuevoPassword
        );

        if (resultadoCambio.type == "success") {
          return res.json({
            type: resultadoCambio.type,
            message: resultadoCambio.message,
          });
        } else {
          return res.json({
            type: resultadoCambio.type,
            message: resultadoCambio.message,
            error: resultadoCambio.error,
          });
        }
      } else {
        //Si el resultado de la consulta no es de tipo success, retornamos un mensaje de error
        return res.json({
          type: resuladoConsulta.type,
          message: resuladoConsulta.message,
          error: resuladoConsulta.error,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      type: "error",
      message:
        "Ocurrió un error al procesar su cambio de contraseña, intentelo de nuevo por favor...",
      error: error.message,
    });
  }
};

//Para el LOGOUT
export const logout = async (req, res) => {
  try {
    res.cookie("tokenpc", "", {
      expires: new Date(0),
    });

    return res.sendStatus(200);
  } catch (error) {
    return res.status(500).json({
      type: "error",
      message: "Ocurrió un error al cerrar la sesión",
      error: error.message,
    });
  }
};

//Obtener datos del colaborador mediante el Usuario
export const getCbyUser = async (req, res) => {
  try {
    if (!req.params.Usuario) {
      return res.json({
        type: "error",
        message:
          "Todos los campos son requeridos en el body, por favor verifique que esten llenos y vuelva a intentarlo...",
      });
    } else {
      const { Usuario } = req.params;

      //Consultamos el usuario recibido en la base de datos
      const resuladoConsulta = await authModel.consultarCporUsuarioModel(
        Usuario
      );

      // Verificamos si el restulataod de la consulta es de tipo success
      if (resuladoConsulta.type == "success") {
        //Retornamos el token
        return res.json({
          type: resuladoConsulta.type,
          message: resuladoConsulta.message,
          data: resuladoConsulta.data,
        });
      } else {
        //Si el resultado de la consulta no es de tipo success, retornamos un mensaje de error
        return res.json({
          type: resuladoConsulta.type,
          message: resuladoConsulta.message,
          error: resuladoConsulta.error,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      type: "error",
      message:
        "Ocurrió un error al validar su consulta con los datos del colaborador enviado",
      error: error.message,
    });
  }
};

//Obtener datos del colaborador mediante el Usuario
export const getPerfilController = async (req, res) => {
  try {
    if (!req.IDColaborador) {
      return res.json({
        type: "error",
        message:
          "Todos los campos son requeridos en la petición, vuelva a intentarlo...",
      });
    } else {
      const IDColaborador = req.IDColaborador;

      //Consultamos el usuario recibido en la base de datos
      const resuladoConsulta = await authModel.consultarPefilDeColaborador(
        IDColaborador
      );

      let linkAvatar =
        SERVER_URL + "/" + resuladoConsulta.data.Usuario + ".jpg";
      // Verificamos si el restulataod de la consulta es de tipo success
      if (resuladoConsulta.type == "success") {
        //Retornamos el token
        return res.json({
          type: resuladoConsulta.type,
          message: resuladoConsulta.message,
          data: resuladoConsulta.data,
          avatar: linkAvatar,
        });
      } else {
        //Si el resultado de la consulta no es de tipo success, retornamos un mensaje de error
        return res.json({
          type: resuladoConsulta.type,
          message: resuladoConsulta.message,
          error: resuladoConsulta.error,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      type: "error",
      message:
        "Ocurrió un error al validar su consulta con los datos del colaborador enviado",
      error: error.message,
    });
  }
};

// Para modificar datos de  un colaborador o actualizarlos
export const ModificarColaborador = async (req, res) => {
  try {
    // Si todos los campos están llenos, continuamos con el modificado
    const {
      IDColaborador,
      NombreCompleto,
      Puesto,
      SiglasPuesto,
      // DPI,
      Usuario,
      Password,
      IDArea,
      IDRol,
      IDAgencia,
      Estado,
    } = req.body; // Obtenemos los datos que nos llegan en el body de la petición

    // Solicitamos que se registre el usuario en la base de datos
    const resultadoConsulta = await authModel.ModificarColaboradorModel(
      IDColaborador,
      NombreCompleto,
      Puesto,
      SiglasPuesto,
      // DPI,
      Usuario,
      Password,
      IDArea,
      IDRol,
      IDAgencia,
      Estado
    );

    // Verificamos si el resultado de la consulta es de tipo success
    if (resultadoConsulta.type == "success") {
      return res.json({
        type: resultadoConsulta.type, // success
        message: resultadoConsulta.message, // Usuario encontrado
      });
    } else {
      // Si el resultado de la consulta no es de tipo success, retornamos un mensaje de error
      return res.json({
        type: resultadoConsulta.type,
        message: resultadoConsulta.message,
        error: resultadoConsulta.error,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      type: "error",
      message:
        "Ocurrió un error al validar su consulta con los datos del colaborador",
      error: error.message,
    });
  }
};
