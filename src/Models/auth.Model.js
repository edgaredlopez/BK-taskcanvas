import { poolDeConexiones } from "../database/db.js";
import bcrypt from "bcryptjs";
import moment from "moment";

//Metodos para cifrar
const cifrarPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    return null;
  }
};
//Metodo para comparar
const compararPassword = async (passwordRecibido, passwordEncriptado) => {
  try {
    let respuestaComparacion = await bcrypt.compare(
      passwordRecibido,
      passwordEncriptado
    );
    return respuestaComparacion;
  } catch (error) {
    return null;
  }
};

//Para el regitro
export const registroModel = async (
  NombreCompleto,
  Fotografia,
  Puesto,
  SiglasPuesto,
  // DPI,
  Usuario,
  Password,
  IDArea,
  IDRol,
  IDAgencia
) => {
  try {
    //Verificarmos que el usuario no exista
    const [resultadoUsuario] = await poolDeConexiones.query(
      "SELECT * FROM colaborador WHERE Usuario=?",
      [Usuario]
    );

    if (resultadoUsuario.length > 0) {
      return {
        type: "error",
        message:
          "El colaborador que quiere registrar ya existe en la base de datos, por favor verifique los datos...",
      };
    } else {
      //Encriptar contraseña
      const PasswordCifrado = await cifrarPassword(Password);
      const [resultado] = await poolDeConexiones.query(
        "INSERT INTO colaborador (Nombre, Fotografia, Puesto, SiglasPuesto, Usuario, Password, Estado, IDArea, IDRol, IDAgencia) VALUES (?,?,?,?,?,?,?,?,?,?)",
        [
          NombreCompleto,
          "ADSFADF",
          Puesto,
          SiglasPuesto,
          // DPI,
          Usuario,
          PasswordCifrado,
          1,
          IDArea,
          IDRol,
          IDAgencia,
        ]
      );

      if (resultado.affectedRows > 0) {
        return {
          type: "success",
          message: "Colaborador registrado correctamente",
          data: {
            IDUsuario: resultado.insertId,
          },
        };
      } else {
        return {
          type: "danger",
          message: "No se pudo registrar el colaborador correctamente",
        };
      }
    }
  } catch (error) {
    console.log(error);
    return {
      type: "error",
      message:
        "Ocurrió un error al validar su consulta con los datos del colaborador",
      error: error.message,
    };
  }
};

//Para consultar y verificar un usuario que se esta logueando
export const loginModel = async (usuarioP, passwordP) => {
  try {
    const [resultado] = await poolDeConexiones.query(
      "SELECT * FROM estudiantes WHERE Usuario=? and Estado != 0",
      [usuarioP]
    );
    if (resultado.length > 0) {
      //Comparar contraseña
      if ((await compararPassword(passwordP, resultado[0].Password)) == true) {
        return {
          type: "success",
          message: "Sesión autorizada satisfactoriamente..",
          data: resultado[0],
        };
      } else {
        return {
          type: "danger",
          message:
            "Usuario o contraseña incorrectos, por favor intentelo de nuevo.",
        };
      }
    } else {
      return {
        type: "danger",
        message:
          "Usuario o contraseña incorrectos, por favor intentelo de nuevo...",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      type: "error",
      message:
        "Ocurrió un error al validar su consulta con los datos del colaborador",
      error: error.message,
    };
  }
};

//Para consultar usuario por ID para el cambio de contraseña
export const comprobacionParaCambioDePassword = async (
  IDColaborador,
  AntiguoPassword
) => {
  try {
    const [resultado] = await poolDeConexiones.query(
      "SELECT * FROM colaborador WHERE IDColaborador=?",
      [IDColaborador]
    );

    //Comparar contraseña
    if (
      (await compararPassword(AntiguoPassword, resultado[0].Password)) == true
    ) {
      return {
        type: "success",
        message: "Si se puede cambiar la contraseña..",
      };
    } else {
      return {
        type: "danger",
        message:
          "No se pudo autorizar el cambio de contraseña, la antigua contraseña es incorrecta.",
      };
    }
  } catch (error) {
    return {
      type: "error",
      message:
        "Ocurrió un error al verificar su contraseña antigua, vuelva a intentarlo por favor...",
      error: error.message,
    };
  }
};

//Para consultar usuario por ID para el cambio de contraseña
export const comprobarExistenciaDeUsuario = async (IDColaborador) => {
  try {
    const [resultado] = await poolDeConexiones.query(
      "SELECT * FROM colaborador WHERE IDColaborador=?",
      [IDColaborador]
    );

    if (resultado.length > 0) {
      return {
        type: "success",
        message: "El usuario si existe...",
        data: resultado
      };
    } else {
      return {
        type: "danger",
        message: "El usuario no existe en la base de datos.",
      };
    }
  } catch (error) {
    return {
      type: "error",
      message:
        "Ocurrió un error al verificar su contraseña antigua, vuelva a intentarlo por favor...",
      error: error.message,
    };
  }
};

export const cambiarPassword = async (IDColaborador, Password) => {
  try {
    //Encriptar contraseña
    const PasswordCifrado = await cifrarPassword(Password);

    const [resultado] = await poolDeConexiones.query(
      "UPDATE colaborador SET Password = ? WHERE IDColaborador = ?",
      [PasswordCifrado, IDColaborador]
    );

    if (resultado.affectedRows > 0) {
      return {
        type: "success",
        message: "¡Su contraseña fue cambiada y actualizada exitosamente!",
      };
    } else {
      return {
        type: "danger",
        message: "¡No se pudo cambiar su contraseña!",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      type: "error",
      message: "¡Ocurrió un error al cambiar su contraseña! C",
      error: error.message,
    };
  }
};

//Para consultar Datos del colaborador  por Usuario
export const consultarCporUsuarioModel = async (usuarioP) => {
  try {
    const [resultado] = await poolDeConexiones.query(
      "SELECT IDColaborador, Nombre, Puesto, SiglasPuesto, Estado, Usuario, Password ,agencias.NombreAgencia, area.NombreArea, colaborador.IDArea, colaborador.IDRol, colaborador.IDAgencia FROM colaborador inner join area on area.IDArea= colaborador.IDArea inner join agencias on agencias.IDAgencia=colaborador.IDAgencia WHERE Usuario=?",
      [usuarioP]
    );
    if (resultado.length > 0) {
      return {
        type: "success",
        message: "Usuario encontrado correctamente...",
        data: resultado[0],
      };
    } else {
      return {
        type: "danger",
        message: "El usuario solicitado no se pudo encontrar...",
      };
    }
  } catch (error) {
    return {
      type: "error",
      message:
        "Ocurrió un error al validar su consulta con los datos del colaborador",
      error: error.message,
    };
  }
};

//Para consultar Datos del colaborador  por Usuario
export const consultarPefilDeColaborador = async (IDColaborador) => {
  try {
    // const [resultado] = await poolDeConexiones.query(
    //   "select IDColaborador, Fotografia, Nombre, Puesto, DPI, agencias.NombreAgencia from colaborador INNER JOIN agencias on agencias.IDAgencia = colaborador.IDAgencia where IDColaborador = ?",
    //   [IDColaborador]
    // );
    const [resultado] = await poolDeConexiones.query(
      "select IDColaborador, Fotografia, Nombre, Puesto, agencias.NombreAgencia, Usuario from colaborador INNER JOIN agencias on agencias.IDAgencia = colaborador.IDAgencia where IDColaborador = ?",
      [IDColaborador]
    );



    if (resultado.length > 0) {
      return {
        type: "success",
        message: "Perfil encontrado correctamente...",
        data: resultado[0],
      };
    } else {
      return {
        type: "danger",
        message: "El perfil solicitado no se pudo encontrar...",
      };
    }
  } catch (error) {
    return {
      type: "error",
      message:
        "Ocurrió un error al validar su consulta con los datos del colaborador",
      error: error.message,
    };
  }
};

// Para reseteo de contrasena
export const resetPasswordModel = async (
  IDColaboradorP,
  UsuarioP,
  NewPasswordP
) => {
  try {
    //Encriptamos nueva contrasena
    const passwordCifradoReset = await cifrarPassword(NewPasswordP);

    //Modificamos contrasena
    const [resultado] = await poolDeConexiones.query(
      "UPDATE colaborador SET Password=? WHERE Usuario=? and IDColaborador=?",
      [passwordCifradoReset, UsuarioP, IDColaboradorP]
    );

    if (resultado.affectedRows > 0) {
      return {
        type: "success",
        message: "Contraseña actualizada  correctamente",
      };
    } else {
      return {
        type: "danger",
        message: "No se pudo actualizar la contraseña",
      };
    }
  } catch (error) {
    return {
      type: "error",
      message:
        "Ocurrió un error al validar su consulta con los datos del colaborador",
      error: error.message,
    };
  }
};

// Para cambiar el estado del usuario del colaborador
export const cambioEstadoModel = async (
  IDColaboradorP,
  UsuarioP,
  newStatusP
) => {
  try {
    //Modificamos
    const [resultado] = await poolDeConexiones.query(
      "UPDATE colaborador SET Estado=? WHERE Usuario=? and IDColaborador=?",
      [newStatusP, UsuarioP, IDColaboradorP]
    );

    if (resultado.affectedRows > 0) {
      return {
        type: "success",
        message: "Estado actualizado correctamente",
      };
    } else {
      return {
        type: "danger",
        message: "No se pudo actualizar el estado del colaborador",
      };
    }
  } catch (error) {
    return {
      type: "error",
      message:
        "Ocurrió un error al validar su consulta con los datos del colaborador",
      error: error.message,
    };
  }
};

// Modificar datos del colaborador
export const ModificarColaboradorModel = async (
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
) => {
  try {
    //Verificarmos que el usuario no exista
    const [resultadoUsuario] = await poolDeConexiones.query(
      "SELECT * FROM colaborador WHERE IDColaborador=?",
      [IDColaborador]
    );


    if (resultadoUsuario.length <= 0) {
      return {
        type: "error",
        message: "El colaborador que quiere modificar no existe...",
      };
    } else {
      //Encriptar contraseña
      const PasswordActualCifrado = resultadoUsuario[0].Password;

      let [resultado] = [];
      //Verificamos si la contraseña es diferente es porque cambió, de lo contrario sigue siendo el mismo
      if (PasswordActualCifrado == Password) {
        [resultado] = await poolDeConexiones.query(
          "UPDATE  colaborador SET Nombre=?, Puesto=?, SiglasPuesto=?, Usuario=?, Estado=?, IDArea=?, IDRol=?, IDAgencia=? WHERE IDColaborador = ? AND IDColaborador",
          [
            NombreCompleto,
            Puesto,
            SiglasPuesto,
            // DPI,
            Usuario,
            Estado,
            IDArea,
            IDRol,
            IDAgencia,
            IDColaborador,
          ]
        );
      } else {
        // Encriptamos la nueva contrasena
        const PasswordCifrado = await cifrarPassword(Password);

        [resultado] = await poolDeConexiones.query(
          "UPDATE  colaborador SET Nombre=?, Puesto=?, SiglasPuesto=?, Usuario=?, Password= ?,Estado=?, IDArea=?, IDRol=?, IDAgencia=? WHERE IDColaborador = ? AND IDColaborador",
          [
            NombreCompleto,
            Puesto,
            SiglasPuesto,
            // DPI,
            Usuario,
            PasswordCifrado,
            Estado,
            IDArea,
            IDRol,
            IDAgencia,
            IDColaborador,
          ]
        );
      }

      if (resultado.affectedRows > 0) {
        return {
          type: "success",
          message: "Los datos del colaborador fueron modificados correctamente",
        };
      } else {
        return {
          type: "danger",
          message: "No se pudo modificar los datos del colaborador solicitado",
        };
      }
    }
  } catch (error) {
    console.log(error);
    return {
      type: "error",
      message:
        "Ocurrió un error al validar su consulta con los datos del colaborador",
      error: error.message,
    };
  }
};
