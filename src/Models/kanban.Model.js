import { poolDeConexiones } from "../database/db.js";

//Para consultar las listas para determinar los tableros
export const ConsultarListasTableros = async () => {
  try {
    const [resultado] = await poolDeConexiones.query(
      "select  IDLista as KeyTablero, NombreLista  from listas"
    );
    if (resultado.length > 0) {
      return {
        type: "success",
        message: "Listas de tableros encontrados correctamente...",
        data: resultado,
      };
    } else {
      return {
        type: "error",
        message: "No se pudieron encontrar las listas de tableros...",
      };
    }
  } catch (error) {
    return {
      type: "error",
      message:
        "Ocurrió un error al validar su consulta con los datos de las listas de colabadores...",
      error: error.message,
    };
  }
};

//Para consultar el ID del ultimo tablero en la base de datos
export const ConsultarIDUltimoTablero = async () => {
  try {
    const [resultado] = await poolDeConexiones.query(
      "select max(IDLista) as IDUltimoTablero FROM listas"
    );
    if (resultado.length > 0) {
      return {
        type: "success",
        message: "ID del ultimo tablero encontrado correctamente...",
        data: resultado,
      };
    } else {
      return {
        type: "error",
        message: "No se pudo consultar el ID del ultimo tablero...",
      };
    }
  } catch (error) {
    return {
      type: "error",
      message: "Ocurrió un error al consultar el ID del ultimo tablero...",
      error: error.message,
    };
  }
};

// Obtener Tickets asignados a un colaborador
export const ConsultarTicketsAsignadosAColaborador = async (IDEstudiante) => {
  try {
    const [resultado] = await poolDeConexiones.query(
      `SELECT 
      IDTarea AS id,
      TareaIdentificador AS NoTicket,
      DATE_FORMAT(FechaYHoraCreacion, '%Y-%m-%d %H:%i:%s') AS FechaYHora,
      DATE_FORMAT(FechaYHoraDeVencimiento, '%Y-%m-%d %H:%i:%s') AS FechaCulminacion,
      Descripcion as Detalles,
      tareas.IDLista AS KeyTablero,
      tareas.IDEstudiante as IDColaborador
  FROM
  tareas
  WHERE
  tareas.IDEstudiante = ?`,
      [IDEstudiante]
    );
    if (resultado.length > 0) {
      return {
        type: "success",
        message: "Hemos encontrado tus tareas correctamente...",
        data: resultado,
      };
    } else {
      return {
        type: "error",
        message:
          "No pudimos encontrar ninguna tarea por el momento...",
      };
    }
  } catch (error) {
    return {
      type: "error",
      message:
        "Ocurrió un error al validar su consulta con los datos del Estudiante enviado...",
      error: error.message,
    };
  }
};

// Obtener data de ticket mediante el ID
export const ConsultarDataTicketPorID = async (IDTicket) => {
  try {
    const [resultado] = await poolDeConexiones.query(
      "select * from procesos where IDProceso = ?",
      [IDTicket]
    );
    if (resultado.length > 0) {
      return {
        type: "success",
        message: "Datos del ticket encontrados correctamente...",
        data: resultado[0],
      };
    } else {
      return {
        type: "error",
        message:
          "No se pudieron encontrar los datos Ticket para el ID enviado...",
      };
    }
  } catch (error) {
    return {
      type: "error",
      message:
        "Ocurrió un error al validar su consulta con el del Ticket  enviado...",
      error: error.message,
    };
  }
};

// Modificar Ubicacion de tablero de TICKET
export const ModificarTableroDeTicket = async (
  IDTicket,
  IDNuevoTablero,
  IDColaborador,
  IDColaboradorPropietario
) => {
  try {
    const [IDUltimoTableroDB] = await poolDeConexiones.query(
      "SELECT max(IDLista) as IDListaMaxima from listas"
    );

    let MotivoRegistro = "";
    let queryUpdate = "";
    if (IDUltimoTableroDB[0].IDListaMaxima == IDNuevoTablero) {
      MotivoRegistro = "Culminacion de Ticket";
      queryUpdate =
        "UPDATE procesos SET IDLista=?, Estado = 2, FechaCulminacion = now() WHERE IDProceso = ?";
    } else {
      MotivoRegistro = "Avance de Ticket";
      queryUpdate = "UPDATE procesos SET IDLista=?  WHERE IDProceso = ?";
    }

    let [resultado] = await poolDeConexiones.query(queryUpdate, [
      IDNuevoTablero,
      IDTicket,
    ]);

   


    // Consultar los detalles que tiene el tickety actualmente para guardarlo en los REGISTROOS de bitacora
    const [DataTicket] = await poolDeConexiones.query(
      "SELECT * from procesos where IDProceso = ?", [IDTicket]
    );




    const [resultadoCreacionDeHistorial] = await poolDeConexiones.query(
      "INSERT INTO registros (FechaYHoraRegistro, DetallesBitacora, MotivoRegistro, IDProceso, IDLista, IDColaborador, IDColaboradorPropietario) VALUES (now(),?,?,?,?,?,?)",
      [
        DataTicket[0].Detalles,
        MotivoRegistro,
        IDTicket,
        IDNuevoTablero,
        IDColaborador,
        IDColaboradorPropietario,
      ]
    );

    if (resultado.affectedRows > 0) {
      return {
        type: "success",
        message: "Ticket avanzado correctamente",
      };
    } else {
      return {
        type: "error",
        message: "No se pudo avanzar el Ticket solicitado.",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      type: "error",
      message: "Ocurrió un error al avanzar el Ticket. M",
      error: error.message,
    };
  }
};

// Obtener colaboradores de agencia
export const getColaboradoresAgencia = async (IDAgencia) => {
  try {
    // --------------Colaboradores --------------------------------
    const [JSONColaboradores] = await poolDeConexiones.query(
      "SELECT IDColaborador, Nombre FROM colaborador where (Estado = 1 and IDAgencia = ? and (IDRol = 5 or IDRol = 6) and (SiglasPuesto ='ADC' OR SiglasPuesto = 'SDC')) ORDER BY Nombre ASC",
      [IDAgencia]
    );
    //Concertimos el JSON en un array asociativo
    const Colaboradores = JSONColaboradores.map((item) => ({
      [item.IDColaborador]: item.Nombre,
    }));

    // Agregar el dato al principio del array
    // Colaboradores.unshift({ 0: "Seleccione un asesor" });

    if (JSONColaboradores.length > 0) {
      return {
        type: "success",
        message: "Datos obtenidos correctamente...",
        data: {
          Colaboradores,
        },
      };
    } else {
      return {
        type: "error",
        message: "Los datos no se pudieron obtener satisfactoriamente...",
      };
    }
  } catch (error) {
    return {
      type: "error",
      message:
        "Ocurrió un error al validar su consulta con los datos enviados...",
      error: error.message,
    };
  }
};

// Modificar el TICKET
export const ActualizarDataTicket = async (
  id,
  Nombre,
  Telefono,
  Monto,
  DPI,
  Detalles,
  IDListaActual,
  IDColaboradorActual,
  IDColaboradorPropietario
) => {
  try {

    console.log(" Monto en model: " + Monto);

    

    let [resultado] = await poolDeConexiones.query(
      "UPDATE procesos SET NombreAsociado = ?, TelefonoAsociado = ?, Monto = ?, DPIAsociado = ?, Detalles = ?  WHERE IDProceso = ?",
      [Nombre, Telefono, Monto, DPI, Detalles, id]
    );

      console.log( resultado);
    // Consultar los detalles que tiene el tickety actualmente para guardarlo en los REGISTROOS de bitacora
    const [DataTicket] = await poolDeConexiones.query(
      "SELECT * from procesos where IDProceso = ?", [id]
    );


    const [resultadoCreacionDeHistorial] = await poolDeConexiones.query(
      "INSERT INTO registros (FechaYHoraRegistro, DetallesBitacora, MotivoRegistro, IDProceso, IDLista, IDColaborador, IDColaboradorPropietario) VALUES (now(),?,?,?,?,?,?)",
      [
        DataTicket[0].Detalles,
        "Actualización de datos de Ticket con ID: " + id,
        id,
        IDListaActual,
        IDColaboradorActual,
        IDColaboradorPropietario,
      ]
    );

    if (
      resultado.affectedRows > 0 &&
      resultadoCreacionDeHistorial.affectedRows > 0
    ) {
      return {
        type: "success",
        message: "Datos de Ticket actualizados correctamente",
      };
    } else {
      return {
        type: "error",
        message: "No se pudo actualizar los datos del Ticket solicitado.",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      type: "error",
      message:
        "Ocurrió un error al intentar actualizar los datos del Ticket. M",
      error: error.message,
    };
  }
};

// Cancelar ticket en la base de datos
export const CancelarTicket = async (
  id,
  IDColaborador,
  IDLista,
  IDColaboradorPropietario,
  IDAgencia
) => {
  try {
    // let [resultado] = await poolDeConexiones.query(
    //   "UPDATE procesos SET Estado = 0 WHERE IDProceso = ?",
    //   [id]
    // );

    // Buscamos en la base de datos en la tabla solicitudes para verificar SI ese Ticket ya tiene solicitud de Cancelación
    const [ResultadoDeExistenciaDeSolicitud] = await poolDeConexiones.query(
      "select * from solicitudes where IDProceso = ?",
      [id]
    );

    // Verificamos si se encontrarion SOLICITUDES EXISTENTES PARA ESE TICKET
    if (ResultadoDeExistenciaDeSolicitud.length > 0) {
     
      // Ahora validamos el estado de esa solicitud, para saber si sigue activa, si fue rechazada ya o si fue aceptada
      switch (ResultadoDeExistenciaDeSolicitud[0].EstadoSolicitud) {
        case 0:
          return {
            type: "danger",
            message:
              "Usted ya envió previamente una solicitud de cancelación para este ticket y ¡Fué RECHAZADA!...",
          };
          break;
        case 1:
          return {
            type: "danger",
            message:
              "Usted ya envió previamente una solicitud de cancelación para este ticket y ¡Sigue en ESPERA!...",
          };
          break;
        case 2:
          return {
            type: "success",
            message:
              "Usted ya envió previamente una solicitud de cancelación para este ticket y ¡Ya fué APROBADA!...",
          };
          break;

        default:
          break;
      }
    }


    // Consultar los detalles que tiene el tickety actualmente para guardarlo en los REGISTROOS de bitacora
    const [DataTicket] = await poolDeConexiones.query(
      "SELECT * from procesos where IDProceso = ?", [id]
    );

    const [resultadoCreacionDeHistorial] = await poolDeConexiones.query(
      "INSERT INTO registros (FechaYHoraRegistro, DetallesBitacora, MotivoRegistro, IDProceso, IDLista, IDColaborador, IDColaboradorPropietario) VALUES (now(),?,?,?,?,?,?)",
      [
        DataTicket[0].Detalles,
        "Solicitud de cancelación de ticket",
        id,
        IDLista,
        IDColaborador,
        IDColaboradorPropietario,
      ]
    );

    const [RespuestaDeInsersionDeSolicitud] = await poolDeConexiones.query(
      "INSERT INTO solicitudes (FechaDeSolicitud, EstadoSolicitud, IDAgencia, IDColaborador, IDProceso) VALUES (now(),?,?,?,?)",
      [1, IDAgencia, IDColaborador, id]
    );
    if (
      resultadoCreacionDeHistorial.affectedRows > 0 &&
      RespuestaDeInsersionDeSolicitud.affectedRows > 0
    ) {
      return {
        type: "success",
        message:
          "¡Se ha enviado su solicitud para la cancelación del Ticket! El ticket seguirá apareciendo hasta que sea aprobado...",
      };
    } else {
      return {
        type: "error",
        message:
          "No se pudo enviar la solicitud para la cancelación del ticket.",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      type: "error",
      message:
        "Ocurrió un error al intentar enviar su solicitud para cancelación de ticket. M",
      error: error.message,
    };
  }
};

// Para trasladar el ticket a otro colaborador
export const TrasladarTicket = async (
  id,
  IDColaboradorOrigen,
  IDColaboradorDestino,
  IDListaDondeSeEncontraba,
  IDColaboradorPropietario
) => {
  try {
    let [resultado] = await poolDeConexiones.query(
      "UPDATE procesos SET IDColaborador = ?  WHERE IDProceso = ?",
      [IDColaboradorDestino, id]
    );


    // Consultar los detalles que tiene el tickety actualmente para guardarlo en los registros de bitacora
    const [DataTicket] = await poolDeConexiones.query(
      "SELECT * from procesos where IDProceso = ?", [id]
    );


    const [resultadoCreacionDeHistorial] = await poolDeConexiones.query(
      "INSERT INTO registros (FechaYHoraRegistro,DetallesBitacora, MotivoRegistro, IDProceso, IDLista, IDColaborador, IDColaboradorPropietario) VALUES (now(),?,?,?,?,?,?)",
      [
        DataTicket[0].Detalles,
        "Traslado de Ticket con ID: " +
          id +
          " Del colaborador: " +
          IDColaboradorOrigen +
          " Al colaborador: " +
          IDColaboradorDestino,
        id,
        IDListaDondeSeEncontraba,
        IDColaboradorOrigen,
        IDColaboradorPropietario,
      ]
    );

    if (
      resultado.affectedRows > 0 &&
      resultadoCreacionDeHistorial.affectedRows > 0
    ) {
      return {
        type: "success",
        message: "Ticket trasladado a otro colaborador exitosamente...",
      };
    } else {
      return {
        type: "error",
        message: "No se pudo trasladar el Ticket solicitado.",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      type: "error",
      message: "Ocurrió un error al intentar trasladar el Ticket. M",
      error: error.message,
    };
  }
};
