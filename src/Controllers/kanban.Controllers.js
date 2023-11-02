import * as kanbanModel from "../Models/kanban.Model.js";

// Obtener servicios y area para la craicon de ticket
export const getListasTableros = async (req, res) => {
  try {
    //Consultamos los datos recibido en la base de datos
    const resuladoConsulta = await kanbanModel.ConsultarListasTableros();

    // Verificamos si el restulataod de la consulta es de tipo success
    if (resuladoConsulta.type == "success") {
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
  } catch (error) {
    return res.status(500).json({
      type: "error",
      message:
        "Ocurrió un error al validar su consulta para obtener la lista de tableros",
      error: error.message,
    });
  }
};

// Obtener Tickets para un colaborador
export const getTicketsAsignados = async (req, res) => {
  try {
    if (!req.IDEstudiante) {
      return res.json({
        type: "error",
        message:
          "No envió el ID del colaborador, por favor envíelo y vuelva a intentar...",
      });
    } else {
      const IDEstudiante = req.IDEstudiante;

      //Consultamos los datos recibido en la base de datos
      const resuladoConsulta =
        await kanbanModel.ConsultarTicketsAsignadosAColaborador(IDEstudiante);

      // Verificamos si el restulataod de la consulta es de tipo success
      if (resuladoConsulta.type == "success") {
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
        "Ocurrió un error al validar su consulta para obtener los tickets asignados al colaborador",
      error: error.message,
    });
  }
};

// Para mover el ticket de Tablero
export const patchMoverTicket = async (req, res) => {
  try {
    if (
      !req.body.IDTicket ||
      !req.body.IDTableroActual ||
      !req.body.IDTableroNuevo
    ) {
      return res.json({
        type: "error",
        message:
          "Todos los campos son requeridos en el body, por favor verifique que esten llenos y vuelva a intentarlo...",
      });
    } else {
      // Si todos los campos están llenos, continuamos con el modificado
      const { IDTicket, IDTableroActual, IDTableroNuevo } = req.body; // Obtenemos los datos que nos llegan en el body de la petición
      const IDColaborador = req.IDColaborador;
      const IDRol = req.IDRol;

      // Consultamos el ID del ultimo tablero de la base de datos
      const RespuestaConsultaUltimoTablero =
        await kanbanModel.ConsultarIDUltimoTablero();

      const IDUltimoTableroEnLaBaseDeDatos =
        RespuestaConsultaUltimoTablero.data[0].IDUltimoTablero;

      if (IDTableroNuevo == IDUltimoTableroEnLaBaseDeDatos && IDRol != 5) {
        return res.json({
          type: "danger",
          message:
            "Petición rechazada, solo las secretarias pueden culminar los tickets. Traslade el ticket a una secretaria para que pueda culminar el ticket...", // Usuario encontrado
        });
      }

      console.log("Salto: " + (IDTableroNuevo - IDTableroActual) );



      // Verificar que no se quiera avanzar el ticket dos fases a la vez
      if ( (IDTableroNuevo - IDTableroActual) > 1) {
        return res.json({
          type: "danger",
          message:
            "Petición rechazada, solo puede mover el ticket una fase a la vez...", // Usuario encontrado
        });
      }

      // Solicitamos la data del TICKET para corroborar que los datos que se reciben son validos
      const ResultadoConsultaTicketVerificacion =
        await kanbanModel.ConsultarDataTicketPorID(IDTicket);

      let RespuestaAPIMovimientoTicket = null;

      // Verificamos si se obtuvieron datos del ticket solicitado, esto nos servidra para ver si el ticket existe
      if (ResultadoConsultaTicketVerificacion.type == "success") {
        // Verificamos que el IDTableroActual que se enviado y el el IDTableroActual son iguales
        if (
          IDTableroActual == ResultadoConsultaTicketVerificacion.data.IDLista
        ) {
          // Verificamos que el IDTableroNuevo sea mayor que el IDTableroActual
          if (IDTableroNuevo > IDTableroActual) {
            const IDColaboradorPropietario =
              ResultadoConsultaTicketVerificacion.data.IDColaboradorPropietario;

            // Procedemos a actualizar el Ticket para moverlo de posicion
            let RespuestaAvanceDeTicket =
              await kanbanModel.ModificarTableroDeTicket(
                IDTicket,
                IDTableroNuevo,
                IDColaborador,
                IDColaboradorPropietario
              );
            if (RespuestaAvanceDeTicket.type == "success") {
              return res.json({
                type: RespuestaAvanceDeTicket.type, // success
                message: RespuestaAvanceDeTicket.message, // Usuario encontrado
              });
            }
          } else {
            RespuestaAPIMovimientoTicket = {
              type: "danger",
              message:
                "No puede mover un Ticket a la izquierda o en la misma ubicación. Solo se permiten movimientos de avance...",
              error: "No se permiten retrocesos de Ticket",
            };
          }
        } else {
          RespuestaAPIMovimientoTicket = {
            type: "danger",
            message:
              "Los parametros del Ticket que se quiere mover, estan alterados",
            error: "El IDTableroActual está alterado",
          };
        }

        return res.json(RespuestaAPIMovimientoTicket);
      } else {
        // Si el resultado de la consulta no es de tipo success, retornamos un mensaje de error
        return res.json({
          type: ResultadoConsultaTicketVerificacion.type,
          message: ResultadoConsultaTicketVerificacion.message,
          error: ResultadoConsultaTicketVerificacion.error,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      type: "error",
      message:
        "Ocurrió un error al validar su consulta con el ID del ticket enviado. C",
      error: error.message,
    });
  }
};

// Obtener colaboradores de agencia
export const getColaboradoresAgencia = async (req, res) => {
  try {
    if (!req.IDAgencia) {
      return res.json({
        type: "error",
        message:
          "Todos los campos son requeridos en el parametro, por favor verifique que esten llenos y vuelva a intentarlo...",
      });
    } else {
      const IDAgencia = req.IDAgencia;

      //Consultamos los datos recibido en la base de datos
      const resuladoConsulta = await kanbanModel.getColaboradoresAgencia(
        IDAgencia
      );

      // Verificamos si el restulataod de la consulta es de tipo success
      if (resuladoConsulta.type == "success") {
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
      message: "Ocurrió un error al validar su consulta con los datos enviados",
      error: error.message,
    });
  }
};

// Para Actualizar los datos del TICKET
export const patchActualizarTicket = async (req, res) => {
  try {
    if (
      !req.body.id ||
      !req.body.Nombre ||
      !req.body.Telefono ||
      !req.body.Monto ||
      !req.body.DPI ||
      !req.body.Detalles
    ) {
      return res.json({
        type: "error",
        message:
          "Todos los campos son requeridos en el body, por favor verifique que esten llenos y vuelva a intentarlo...",
      });
    } else {
      // Si todos los campos están llenos, continuamos con el modificado
      const { id, Nombre, Telefono, Monto, DPI, Detalles } = req.body; // Obtenemos los datos que nos llegan en el body de la petición


      console.log("El monto recibido es: " + Monto);
      // Solicitamos la data del TICKET para corroborar que los datos que se reciben son validos
      const ResultadoConsultaTicketVerificacion =
        await kanbanModel.ConsultarDataTicketPorID(id);

      // Validar si el Ticket ya esta CULMINADO, ya no permitir actualizaciones solo permtirlo si el rol es ADMINISTRADOR
      if (
        (ResultadoConsultaTicketVerificacion.data.Estado == 0 ||
          ResultadoConsultaTicketVerificacion.data.Estado == 2) &&
        req.IDRol != 1
      ) {
        return res.json({
          type: "danger",
          message:
            "Petición rechazada, No se puede actualizar un Ticket que ya está Cancelado o Culminado...",
        });
      }

      // Verificamos si se obtuvieron datos del ticket solicitado, esto nos servidra para ver si el ticket existe
      if (ResultadoConsultaTicketVerificacion.type == "success") {
        // Declaramos e inicializamos variables que se usaran para el registro
        let IDColaboradorOrigen =
          ResultadoConsultaTicketVerificacion.data.IDColaborador;
        let IDListaDondeSeEncontraba =
          ResultadoConsultaTicketVerificacion.data.IDLista;

        const ResultadoModificacionDeTicket =
          await kanbanModel.ActualizarDataTicket(
            id,
            Nombre,
            Telefono,
            Monto,
            DPI,
            Detalles,
            IDListaDondeSeEncontraba,
            IDColaboradorOrigen,
            ResultadoConsultaTicketVerificacion.data.IDColaboradorPropietario
          );

        // Verificamos si el restulataod de la consulta es de tipo success
        if (ResultadoModificacionDeTicket.type == "success") {
          return res.json({
            type: ResultadoModificacionDeTicket.type,
            message: ResultadoModificacionDeTicket.message,
          });
        } else {
          //Si el resultado de la consulta no es de tipo success, retornamos un mensaje de error
          return res.json({
            type: ResultadoModificacionDeTicket.type,
            message: ResultadoModificacionDeTicket.message,
            error: ResultadoModificacionDeTicket.error,
          });
        }
      } else {
        // Si el resultado de la consulta no es de tipo success, retornamos un mensaje de error
        return res.json({
          type: ResultadoConsultaTicketVerificacion.type,
          message: ResultadoConsultaTicketVerificacion.message,
          error: ResultadoConsultaTicketVerificacion.error,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      type: "error",
      message:
        "Ocurrió un error al validar su consulta con el ID del ticket enviado. C",
      error: error.message,
    });
  }
};

// Para cancelar un TICKET
export const patchCancelarTicket = async (req, res) => {
  try {
    if (!req.body.id) {
      return res.json({
        type: "error",
        message:
          "Todos los campos son requeridos en el body, por favor verifique que esten llenos y vuelva a intentarlo...",
      });
    } else {
      // Si todos los campos están llenos, continuamos con el modificado
      const { id } = req.body; // Obtenemos los datos que nos llegan en el body de la petición

      // Solicitamos la data del TICKET para corroborar que los datos que se reciben son validos
      const ResultadoConsultaTicketVerificacion =
        await kanbanModel.ConsultarDataTicketPorID(id);

      // Validar si el Ticket ya esta CULMINADO, ya no permitir actualizaciones solo permtirlo si el rol es ADMINISTRADOR
      if (
        (ResultadoConsultaTicketVerificacion.data.Estado == 0 ||
          ResultadoConsultaTicketVerificacion.data.Estado == 2) &&
        req.IDRol != 1
      ) {
        return res.json({
          type: "danger",
          message:
            "Petición rechazada, No se puede actualizar un Ticket que ya está Cancelado o Culminado...",
        });
      }

      // Verificamos si se obtuvieron datos del ticket solicitado, esto nos servidra para ver si el ticket existe
      if (ResultadoConsultaTicketVerificacion.type == "success") {
        const ResultadoCancelacionDeTicket = await kanbanModel.CancelarTicket(
          id,
          req.IDColaborador,
          ResultadoConsultaTicketVerificacion.data.IDLista,
          ResultadoConsultaTicketVerificacion.data.IDColaboradorPropietario,
          req.IDAgencia
        );

        // Verificamos si el restulataod de la consulta es de tipo success
        if (ResultadoCancelacionDeTicket.type == "success") {
          return res.json({
            type: ResultadoCancelacionDeTicket.type,
            message: ResultadoCancelacionDeTicket.message,
          });
        } else {
          //Si el resultado de la consulta no es de tipo success, retornamos un mensaje de error
          return res.json({
            type: ResultadoCancelacionDeTicket.type,
            message: ResultadoCancelacionDeTicket.message,
            error: ResultadoCancelacionDeTicket.error,
          });
        }
      } else {
        // Si el resultado de la consulta no es de tipo success, retornamos un mensaje de error
        return res.json({
          type: ResultadoConsultaTicketVerificacion.type,
          message: ResultadoConsultaTicketVerificacion.message,
          error: ResultadoConsultaTicketVerificacion.error,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      type: "error",
      message:
        "Ocurrió un error al validar su consulta con el ID del ticket enviado. C",
      error: error.message,
    });
  }
};

// Para Trasladar un ticket
export const PatchTrasladarTicket = async (req, res) => {
  try {
    if (!req.body.id || !req.body.IDColaboradorDestino) {
      return res.json({
        type: "error",
        message:
          "Todos los campos son requeridos en el body, por favor verifique que esten llenos y vuelva a intentarlo...",
      });
    } else {
      // Si todos los campos están llenos, continuamos con el modificado
      const { id, IDColaboradorDestino } = req.body; // Obtenemos los datos que nos llegan en el body de la petición

      // Solicitamos la data del TICKET para corroborar que los datos que se reciben son validos
      const ResultadoConsultaTicketVerificacion =
        await kanbanModel.ConsultarDataTicketPorID(id);

      // Verificamos si se obtuvieron datos del ticket solicitado, esto nos servidra para ver si el ticket existe
      if (ResultadoConsultaTicketVerificacion.type == "success") {
        // Declaramos e inicializamos variables que se usaran para el registro
        let IDColaboradorOrigen =
          ResultadoConsultaTicketVerificacion.data.IDColaborador;
        let IDListaDondeSeEncontraba =
          ResultadoConsultaTicketVerificacion.data.IDLista;

        if (IDColaboradorOrigen != IDColaboradorDestino) {
          // Mandamos a solicitar el traslado al MODEL
          const ResultadoDeTrasladoDeTicket = await kanbanModel.TrasladarTicket(
            id,
            IDColaboradorOrigen,
            IDColaboradorDestino,
            IDListaDondeSeEncontraba
          );

          // Verificamos si el restulataod de la consulta es de tipo success
          if (ResultadoDeTrasladoDeTicket.type == "success") {
            return res.json({
              type: ResultadoDeTrasladoDeTicket.type,
              message: ResultadoDeTrasladoDeTicket.message,
            });
          } else {
            //Si el resultado de la consulta no es de tipo success, retornamos un mensaje de error
            return res.json({
              type: ResultadoDeTrasladoDeTicket.type,
              message: ResultadoDeTrasladoDeTicket.message,
              error: ResultadoDeTrasladoDeTicket.error,
            });
          }
        } else {
          return res.json({
            type: "danger",
            message:
              "No puede hacer un traslado de Ticket a usted mismo, petición rechazada...",
          });
        }
      } else {
        // Si el resultado de la consulta no es de tipo success, retornamos un mensaje de error
        return res.json({
          type: ResultadoConsultaTicketVerificacion.type,
          message: ResultadoConsultaTicketVerificacion.message,
          error: ResultadoConsultaTicketVerificacion.error,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      type: "error",
      message:
        "Ocurrió un error al validar su consulta con el ID del ticket enviado. C",
      error: error.message,
    });
  }
};
