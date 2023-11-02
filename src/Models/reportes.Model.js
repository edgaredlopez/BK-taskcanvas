import { poolDeConexiones } from "../database/db.js";

// Obtener agencias y colaboradores para los reportes
export const consultarAgenciasYAsesores = async (IDRol, IDAgencia, IDAgenciaEnviadoFron) => {
  try {

    console.log(IDRol, IDAgenciaEnviadoFron);
    let ScriptAgencia = "";
    let ScriptColaboradores = "";

    switch (IDRol) {
      case 1:
        ScriptAgencia =
          "SELECT IDAgencia, NombreAgencia FROM agencias ORDER BY IDAgencia ASC";

        if (IDAgenciaEnviadoFron == 0) {
          ScriptColaboradores =
            "SELECT IDColaborador, Nombre FROM colaborador where (Estado = 1 and (IDRol = 5 or IDRol = 6) and (SiglasPuesto ='ADC' OR SiglasPuesto = 'SDC')  ) ORDER BY Nombre ASC";
        } else {
          ScriptColaboradores =
            "SELECT IDColaborador, Nombre FROM colaborador where (  Estado = 1 and (IDRol = 5 or IDRol = 6) and (SiglasPuesto ='ADC' OR SiglasPuesto = 'SDC')  and IDAgencia = " +
            IDAgenciaEnviadoFron +
            " ) ORDER BY Nombre ASC";
        }


        break;
      case 2:
        ScriptAgencia =
          "SELECT IDAgencia, NombreAgencia FROM agencias ORDER BY IDAgencia ASC";

        if (IDAgenciaEnviadoFron == 0) {
          ScriptColaboradores =
            "SELECT IDColaborador, Nombre FROM colaborador where (Estado = 1 and (IDRol = 5 or IDRol = 6) and (SiglasPuesto ='ADC' OR SiglasPuesto = 'SDC')  ) ORDER BY Nombre ASC";
        } else {
          ScriptColaboradores =
            "SELECT IDColaborador, Nombre FROM colaborador where (  Estado = 1 and (IDRol = 5 or IDRol = 6) and (SiglasPuesto ='ADC' OR SiglasPuesto = 'SDC')  and IDAgencia = " +
            IDAgenciaEnviadoFron +
            " ) ORDER BY Nombre ASC";
        }

        break;
      case 3:
        ScriptAgencia =
          "SELECT IDAgencia, NombreAgencia FROM agencias  where IDAgencia = '" +
          IDAgencia +
          "' ORDER BY IDAgencia ASC";
        ScriptColaboradores =
          "SELECT IDColaborador, Nombre FROM colaborador where ( IDAgencia = '" +
          IDAgencia +
          "' AND Estado = 1 and (IDRol = 5 or IDRol = 6) and (SiglasPuesto ='ADC' OR SiglasPuesto = 'SDC')) ORDER BY Nombre ASC";
        break;
      case 4:
        ScriptAgencia =
          "SELECT IDAgencia, NombreAgencia FROM agencias  where IDAgencia = '" +
          IDAgencia +
          "' ORDER BY IDAgencia ASC";

        ScriptColaboradores =
          "SELECT IDColaborador, Nombre FROM colaborador where ( IDAgencia = '" +
          IDAgencia +
          "' AND Estado = 1 and (IDRol = 5 or IDRol = 6) and (SiglasPuesto ='ADC' OR SiglasPuesto = 'SDC')) ORDER BY Nombre ASC";
        break;
      case 5:
        ScriptAgencia =
          "SELECT IDAgencia, NombreAgencia FROM agencias where IDAgencia = '" +
          IDAgencia +
          "' ORDER BY IDAgencia ASC ";

        ScriptColaboradores =
          "SELECT IDColaborador, Nombre FROM colaborador where ( IDAgencia = '" +
          IDAgencia +
          "' AND Estado = 1 and (IDRol = 5 or IDRol = 6) and (SiglasPuesto ='ADC' OR SiglasPuesto = 'SDC')) ORDER BY Nombre ASC";

        break;
      case 6:
        ScriptAgencia =
          "SELECT IDAgencia, NombreAgencia FROM agencias  where IDAgencia = '" +
          IDAgencia +
          "' ORDER BY IDAgencia ASC";

        ScriptColaboradores =
          "SELECT IDColaborador, Nombre FROM colaborador where ( IDAgencia = '" +
          IDAgencia +
          "' AND Estado = 1 and (IDRol = 5 or IDRol = 6) and (SiglasPuesto ='ADC' OR SiglasPuesto = 'SDC')) ORDER BY Nombre ASC";

        break;

      default:
        break;
    }

    // --------------Agencias --------------------------------
    const [JSONAgencias] = await poolDeConexiones.query(ScriptAgencia);
    //Concertimos el JSON en un array asociativo
    const Agencias = JSONAgencias.map((item) => ({
      [item.IDAgencia]: item.NombreAgencia,
    }));

    if (IDRol != 3) {
      // Agregar el dato al principio del array
      Agencias.unshift({ 0: "Seleccione una agencia" });
    }

    // --------------Colaboradores --------------------------------
    const [JSONColaboradores] = await poolDeConexiones.query(
      ScriptColaboradores
    );
    //Concertimos el JSON en un array asociativo
    const Colaboradores = JSONColaboradores.map((item) => ({
      [item.IDColaborador]: item.Nombre,
    }));
    // Agregar el dato al principio del array
    Colaboradores.unshift({ 0: "Seleccione un colaborador" });

    if (JSONColaboradores.length > 0 && JSONAgencias.length > 0) {
      return {
        type: "success",
        message: "Datos obtenidos correctamente...",
        data: {
          Agencias,
          Colaboradores,
        },
      };
    } else {
      return {
        type: "danger",
        message: "Los datos no se pudieron obtener correctamente...",
      };
    }
  } catch (error) {
    return {
      type: "error",
      message: "Ocurrió un error al validar su consulta...M",
      error: error.message,
    };
  }
};

// Para consultar el reporte general
export const consultarReporteGeneral = async (
  IDAgencia,
  FDesde,
  FHasta,
  IDAsesor
) => {
  try {
    /// -------------- Script de consulta para REPORTE GENERAL ------------
    let query = `SELECT 
      procesos.IDProceso AS id,
      Ticket,
      NombreAsociado,
      CONCAT('Q ', FORMAT(Monto, 2)) AS 'Monto',
      TelefonoAsociado,
      Detalles,
      procesos.DPIAsociado,
      DATE_FORMAT(FechaYHoraCreacion, '%Y-%m-%d %H:%i:%s') AS FechaYHoraCreacion,
      listas.NombreLista,
      
      
      
      CASE procesos.Estado
      when 2 THEN
          (CONCAT(TIMESTAMPDIFF(DAY,
                      FechaYHoraCreacion,
                      (SELECT 
                              MAX(FechaYHoraRegistro)
                          FROM
                              registros
                          WHERE
                              IDProceso = procesos.IDProceso
                                  AND MotivoRegistro = 'Culminacion de Ticket')),
                  ' días, ',
                  MOD(TIMESTAMPDIFF(HOUR,
                          FechaYHoraCreacion,
                          (SELECT 
                                  MAX(FechaYHoraRegistro)
                              FROM
                                  registros
                              WHERE
                                  IDProceso = procesos.IDProceso
                                      AND MotivoRegistro = 'Culminacion de Ticket')),
                      24),
                  ' horas, ',
                  MOD(TIMESTAMPDIFF(MINUTE,
                          FechaYHoraCreacion,
                          (SELECT 
                                  MAX(FechaYHoraRegistro)
                              FROM
                                  registros
                              WHERE
                                  IDProceso = procesos.IDProceso
                                      AND MotivoRegistro = 'Culminacion de Ticket')),
                      60),
                  ' minutos'))
                  
                  
                  
                  
                  
                  
			when 0 THEN
            
          (CONCAT(TIMESTAMPDIFF(DAY,
                      FechaYHoraCreacion,
                      (SELECT 
                              MAX(FechaYHoraRegistro)
                          FROM
                              registros
                          WHERE
                              IDProceso = procesos.IDProceso
                                  AND MotivoRegistro = 'Solicitud de cancelación de Ticket APROBADA')),
                  ' días, ',
                  MOD(TIMESTAMPDIFF(HOUR,
                          FechaYHoraCreacion,
                          (SELECT 
                                  MAX(FechaYHoraRegistro)
                              FROM
                                  registros
                              WHERE
                                  IDProceso = procesos.IDProceso
                                      AND MotivoRegistro = 'Solicitud de cancelación de Ticket APROBADA')),
                      24),
                  ' horas, ',
                  MOD(TIMESTAMPDIFF(MINUTE,
                          FechaYHoraCreacion,
                          (SELECT 
                                  MAX(FechaYHoraRegistro)
                              FROM
                                  registros
                              WHERE
                                  IDProceso = procesos.IDProceso
                                      AND MotivoRegistro = 'Solicitud de cancelación de Ticket APROBADA')),
                      60),
                  ' minutos'))


		ELSE

                  
          (CONCAT(TIMESTAMPDIFF(DAY,
                      FechaYHoraCreacion,
                      NOW()),
                  ' días, ',
                  MOD(TIMESTAMPDIFF(HOUR,
                          FechaYHoraCreacion,
                          NOW()),
                      24),
                  ' horas, ',
                  MOD(TIMESTAMPDIFF(MINUTE,
                          FechaYHoraCreacion,
                          NOW()),
                      60),
                  ' minutos')) END AS tiempo_transcurrido,



      colaborador.Nombre,
      agencias.NombreAgencia,
      IF(procesos.Estado = 1,
          'Activo',
          IF(procesos.Estado = 2,
              'Culminado',
              'Cancelado')) AS Estado
  FROM
      procesos
          INNER JOIN
      listas ON listas.IDLista = procesos.IDLista
          INNER JOIN
      colaborador ON colaborador.IDColaborador = procesos.IDColaboradorPropietario
          INNER JOIN
      agencias ON agencias.IDAgencia = procesos.IDAgencia`;
    const params = [];

    if (IDAgencia > 0 && IDAsesor > 0) {
      query +=
        " WHERE procesos.IDAgencia = ? AND procesos.IDColaboradorPropietario = ?";
      params.push(IDAgencia, IDAsesor);
    } else if (IDAgencia > 0) {
      query += " WHERE procesos.IDAgencia = ?";
      params.push(IDAgencia);
    } else if (IDAsesor > 0) {
      query += " WHERE procesos.IDColaboradorPropietario = ?";
      params.push(IDAsesor);
    }

    query +=
      " AND date(procesos.FechaYHoraCreacion) BETWEEN ? AND ? ORDER BY procesos.IDProceso";

    const [RespuestaReporteGeneral] = await poolDeConexiones.query(query, [
      ...params,
      FDesde,
      FHasta,
    ]);

    if (RespuestaReporteGeneral.length > 0) {
      return {
        type: "success",
        message: "Reporte obtenido correctamente...",
        data: {
          RespuestaReporteGeneral,
        },
      };
    } else {
      return {
        type: "danger",
        message: "No se se encontraron resultados para su consulta...",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      type: "error",
      message: "Ocurrió un error al obtener el reporte general...M",
      error: error.message,
    };
  }
};

// Para consultar el reporte general para EXCEL
export const consultarReporteGeneralParaExcel = async (
  IDAgencia,
  FDesde,
  FHasta,
  IDAsesor
) => {
  try {
    /// -------------- Script de consulta para REPORTE GENERAL ------------
    let query = `SELECT 
      procesos.IDProceso AS ID,
      Ticket,
      NombreAsociado AS 'Nombre de asociado',
      CONCAT('Q', FORMAT(Monto, 2)) AS 'Monto de crédito',
      TelefonoAsociado AS 'Telefono de asociado',
      Detalles,
      procesos.DPIAsociado AS 'DPI de asociado',
      DATE_FORMAT(FechaYHoraCreacion, '%Y-%m-%d %H:%i:%s') AS 'Fecha y Hora de creación',
      listas.NombreLista,



      CASE procesos.Estado
      when 2 THEN
          (CONCAT(TIMESTAMPDIFF(DAY,
                      FechaYHoraCreacion,
                      (SELECT 
                              MAX(FechaYHoraRegistro)
                          FROM
                              registros
                          WHERE
                              IDProceso = procesos.IDProceso
                                  AND MotivoRegistro = 'Culminacion de Ticket')),
                  ' días, ',
                  MOD(TIMESTAMPDIFF(HOUR,
                          FechaYHoraCreacion,
                          (SELECT 
                                  MAX(FechaYHoraRegistro)
                              FROM
                                  registros
                              WHERE
                                  IDProceso = procesos.IDProceso
                                      AND MotivoRegistro = 'Culminacion de Ticket')),
                      24),
                  ' horas, ',
                  MOD(TIMESTAMPDIFF(MINUTE,
                          FechaYHoraCreacion,
                          (SELECT 
                                  MAX(FechaYHoraRegistro)
                              FROM
                                  registros
                              WHERE
                                  IDProceso = procesos.IDProceso
                                      AND MotivoRegistro = 'Culminacion de Ticket')),
                      60),
                  ' minutos'))
                  
                  
                  
                  
                  
                  
			when 0 THEN
            
          (CONCAT(TIMESTAMPDIFF(DAY,
                      FechaYHoraCreacion,
                      (SELECT 
                              MAX(FechaYHoraRegistro)
                          FROM
                              registros
                          WHERE
                              IDProceso = procesos.IDProceso
                                  AND MotivoRegistro = 'Solicitud de cancelación de Ticket APROBADA')),
                  ' días, ',
                  MOD(TIMESTAMPDIFF(HOUR,
                          FechaYHoraCreacion,
                          (SELECT 
                                  MAX(FechaYHoraRegistro)
                              FROM
                                  registros
                              WHERE
                                  IDProceso = procesos.IDProceso
                                      AND MotivoRegistro = 'Solicitud de cancelación de Ticket APROBADA')),
                      24),
                  ' horas, ',
                  MOD(TIMESTAMPDIFF(MINUTE,
                          FechaYHoraCreacion,
                          (SELECT 
                                  MAX(FechaYHoraRegistro)
                              FROM
                                  registros
                              WHERE
                                  IDProceso = procesos.IDProceso
                                      AND MotivoRegistro = 'Solicitud de cancelación de Ticket APROBADA')),
                      60),
                  ' minutos'))


		ELSE

                  
          (CONCAT(TIMESTAMPDIFF(DAY,
                      FechaYHoraCreacion,
                      NOW()),
                  ' días, ',
                  MOD(TIMESTAMPDIFF(HOUR,
                          FechaYHoraCreacion,
                          NOW()),
                      24),
                  ' horas, ',
                  MOD(TIMESTAMPDIFF(MINUTE,
                          FechaYHoraCreacion,
                          NOW()),
                      60),
                  ' minutos')) END AS 'Tiempo Transcurrido',
                  
                  
      



      colaborador.Nombre AS 'Nombre colaborador',
      agencias.NombreAgencia AS 'Nombre de Agencia',
      IF(procesos.Estado = 1,
          'Activo',
          IF(procesos.Estado = 2,
              'Culminado',
              'Cancelado')) AS 'Estado de Ticket'
  FROM
      procesos
          INNER JOIN
      listas ON listas.IDLista = procesos.IDLista
          INNER JOIN
      colaborador ON colaborador.IDColaborador = procesos.IDColaboradorPropietario
          INNER JOIN
      agencias ON agencias.IDAgencia = procesos.IDAgencia
      
      `;
    const params = [];

    if (IDAgencia > 0 && IDAsesor > 0) {
      query +=
        " WHERE procesos.IDAgencia = ? AND procesos.IDColaboradorPropietario = ?";
      params.push(IDAgencia, IDAsesor);
    } else if (IDAgencia > 0) {
      query += " WHERE procesos.IDAgencia = ?";
      params.push(IDAgencia);
    } else if (IDAsesor > 0) {
      query += " WHERE procesos.IDColaboradorPropietario = ?";
      params.push(IDAsesor);
    }

    query +=
      " AND date(procesos.FechaYHoraCreacion) BETWEEN ? AND ? ORDER BY procesos.IDProceso";

    const [RespuestaReporteGeneral] = await poolDeConexiones.query(query, [
      ...params,
      FDesde,
      FHasta,
    ]);

    if (RespuestaReporteGeneral.length > 0) {
      return {
        type: "success",
        message: "Reporte obtenido correctamente...",
        data: {
          RespuestaReporteGeneral,
        },
      };
    } else {
      return {
        type: "danger",
        message: "No se se encontraron resultados para su consulta...",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      type: "error",
      message: "Ocurrió un error al obtener el reporte general...M",
      error: error.message,
    };
  }
};

// Para consultar el reporte general
export const consultarDataGeneralTicket = async (
  IDAgencia,
  Ticket,
  DPIAsociado
) => {
  try {
    // Script de consulta para REPORTE GENERAL
    let query = `SELECT  IDProceso, 
      NombreAsociado, 
      CONCAT('Q ', FORMAT(Monto, 2)) AS Monto,
      TelefonoAsociado, 
      DPIAsociado, 
      DATE_FORMAT(FechaYHoraCreacion, '%Y-%m-%d %H:%i:%s') AS 'FechaYHoraCreacion', 
      IF(procesos.Estado = 1, 'Activo', IF(procesos.Estado = 2, 'Culminado', 'Cancelado')) AS Estado, 
      procesos.Detalles, 
      procesos.JustificacionDeCancelacion 
      FROM procesos
      `;

    const params = [];
    let whereClause = "";

    if (IDAgencia > 0) {
      whereClause += " IDAgencia = ?";
      params.push(IDAgencia);
    }

    if (Ticket && Ticket !== "" && Ticket !== " ") {
      if (whereClause !== "") {
        whereClause += " AND";
      }
      whereClause += " Ticket LIKE ?";
      params.push(`%${Ticket}%`);
    }

    if (DPIAsociado && DPIAsociado !== "" && DPIAsociado !== " ") {
      if (whereClause !== "") {
        whereClause += " AND";
      }
      whereClause += " DPIAsociado = ?";
      params.push(DPIAsociado);
    }

    if (whereClause !== "") {
      query += " WHERE " + whereClause;
    } else {
      return {
        type: "error",
        message: "No se proporcionaron parámetros válidos para la consulta.",
      };
    }

    console.log(query);

    const [DataGeneralTicket] = await poolDeConexiones.query(query, params);

    console.log(DataGeneralTicket);
    if (DataGeneralTicket.length > 0) {
      return {
        type: "success",
        message: "Datos generales de Ticket obtenidos correctamente.",
        data: {
          DataGeneralTicket,
        },
      };
    } else {
      return {
        type: "danger",
        message: "No se encontraron resultados para su consulta.",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      type: "error",
      message: "Ocurrió un error al obtener los datos generales del ticket.",
      error: error.message,
    };
  }
};

// Para consultar el reporte de un Ticket especifico
export const consultarReporteDeUnTicketEspecifico = async (
  IDTicketEncontrado
) => {
  try {
    /// -------------- Script de consulta para REPORTE GENERAL ------------
    const [RespuestaReporteEspecifico] = await poolDeConexiones.query(
      `SELECT  r.IDRegistro as id, 
      p.Ticket, 
      DATE_FORMAT(r.FechaYHoraRegistro, '%Y-%m-%d %H:%i:%s') AS FechaYHoraRegistro, 
      l.NombreLista, r.MotivoRegistro,
      r. DetallesBitacora,
      CONCAT(
        TIMESTAMPDIFF(DAY, p.FechaYHoraCreacion, r.FechaYHoraRegistro), ' días, ', 
        MOD(TIMESTAMPDIFF(HOUR, p.FechaYHoraCreacion, r.FechaYHoraRegistro), 24), ' horas, ', 
        MOD(TIMESTAMPDIFF(MINUTE, p.FechaYHoraCreacion, r.FechaYHoraRegistro), 60), ' minutos'
        ) 
        AS TiempoTranscurrido, 
      CONCAT(
        TIMESTAMPDIFF(DAY, LAG(r.FechaYHoraRegistro) OVER (ORDER BY r.FechaYHoraRegistro), r.FechaYHoraRegistro), ' días, ', 
        MOD(TIMESTAMPDIFF(HOUR, LAG(r.FechaYHoraRegistro) OVER (ORDER BY r.FechaYHoraRegistro), r.FechaYHoraRegistro), 24), ' horas, ', 
        MOD(TIMESTAMPDIFF(MINUTE, LAG(r.FechaYHoraRegistro) OVER (ORDER BY r.FechaYHoraRegistro), r.FechaYHoraRegistro), 60), ' minutos'
        ) 
        AS TiempoTranscurridoDesdeElUltimoRegistro, 
        c.Nombre as Asesor, a.NombreAgencia 
        FROM registros r 
        INNER JOIN procesos p ON p.IDProceso = r.IDProceso 
        INNER JOIN listas l ON l.IDLista = r.IDLista 
        INNER JOIN colaborador c ON c.IDColaborador = r.IDColaborador 
        INNER JOIN agencias a ON a.IDAgencia = p.IDAgencia 
        WHERE p.IDProceso = ? ORDER BY r.FechaYHoraRegistro DESC`,
      [IDTicketEncontrado]
    );

    if (RespuestaReporteEspecifico.length > 0) {
      return {
        type: "success",
        message: "Reporte obtenido correctamente...",
        data: {
          RespuestaReporteEspecifico,
        },
      };
    } else {
      return {
        type: "danger",
        message: "No se se encontraron resultados para su consulta...",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      type: "error",
      message: "Ocurrió un error al obtener el reporte general...M",
      error: error.message,
    };
  }
};

// Consultar reporte de un ticket especifico para EXCEL
export const consultarReporteDeUnTicketEspecificoExcel = async (
  IDTicketEncontrado
) => {
  try {
    /// -------------- Script de consulta para REPORTE GENERAL ------------
    const [RespuestaReporteEspecifico] = await poolDeConexiones.query(
      "SELECT  r.IDRegistro as 'ID de Registro', p.Ticket as Ticket, DATE_FORMAT(r.FechaYHoraRegistro, '%Y-%m-%d %H:%i:%s') AS 'Fecha y hora de registro', l.NombreLista as 'Lista final', r.MotivoRegistro as 'Motivo de registro', r. DetallesBitacora as 'Bitácora de comentarios', CONCAT(TIMESTAMPDIFF(DAY, p.FechaYHoraCreacion, r.FechaYHoraRegistro), ' días, ', MOD(TIMESTAMPDIFF(HOUR, p.FechaYHoraCreacion, r.FechaYHoraRegistro), 24), ' horas, ', MOD(TIMESTAMPDIFF(MINUTE, p.FechaYHoraCreacion, r.FechaYHoraRegistro), 60), ' minutos') AS 'Tiempo transcurrido desde la creación', CONCAT(TIMESTAMPDIFF(DAY, LAG(r.FechaYHoraRegistro) OVER (ORDER BY r.FechaYHoraRegistro), r.FechaYHoraRegistro), ' días, ', MOD(TIMESTAMPDIFF(HOUR, LAG(r.FechaYHoraRegistro) OVER (ORDER BY r.FechaYHoraRegistro), r.FechaYHoraRegistro), 24), ' horas, ', MOD(TIMESTAMPDIFF(MINUTE, LAG(r.FechaYHoraRegistro) OVER (ORDER BY r.FechaYHoraRegistro), r.FechaYHoraRegistro), 60), ' minutos') AS 'Tiempo transcurrido desde el ultimo registro', c.Nombre as Asesor, a.NombreAgencia as 'Nombre de agencia' FROM registros r INNER JOIN procesos p ON p.IDProceso = r.IDProceso INNER JOIN listas l ON l.IDLista = r.IDLista INNER JOIN colaborador c ON c.IDColaborador = r.IDColaboradorPropietario INNER JOIN agencias a ON a.IDAgencia = p.IDAgencia WHERE p.IDProceso = ? ORDER BY r.FechaYHoraRegistro DESC",
      [IDTicketEncontrado]
    );

    if (RespuestaReporteEspecifico.length > 0) {
      return {
        type: "success",
        message: "Reporte obtenido correctamente...",
        data: {
          RespuestaReporteEspecifico,
        },
      };
    } else {
      return {
        type: "danger",
        message: "No se se encontraron resultados para su consulta...",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      type: "error",
      message: "Ocurrió un error al obtener el reporte general...M",
      error: error.message,
    };
  }
};

export const consultarReportePorAsesor = async (
  IDAgencia,
  FDesde,
  FHasta,
  IDAsesor
) => {
  try {
    // Para TIEMPO PROMEDIO DE CULMINACION
    let query = `
    SELECT
        c.IDColaborador AS id,
        c.Nombre AS NombreAsesor,
        CONCAT('Q ', FORMAT(subquery.MontoEdgar, 2)) AS MontoEdgar,
        c.Telefono AS TelefonoColaborador,
        subquery.TicketsAsignados,
        Activos.TicketsActivos,
        Culminados.TicketsCulminados,
        Cancelados.TicketsCancelados,
        CONCAT(
          FLOOR(ABS(AVG(CASE WHEN r.MotivoRegistro = 'Culminacion de Ticket' THEN TIMESTAMPDIFF(DAY, p.FechaYHoraCreacion, r.FechaYHoraRegistro) END))), ' días, ',
          FLOOR(ABS(AVG(CASE WHEN r.MotivoRegistro = 'Culminacion de Ticket' THEN TIMESTAMPDIFF(HOUR, p.FechaYHoraCreacion, r.FechaYHoraRegistro) % 24 END))), ' horas, ',
          FLOOR(ABS(AVG(CASE WHEN r.MotivoRegistro = 'Culminacion de Ticket' THEN TIMESTAMPDIFF(MINUTE, p.FechaYHoraCreacion, r.FechaYHoraRegistro) % 60 END))), ' minutos'
      ) AS TiempoPromedioCulminacion
      
    FROM
        colaborador c
        LEFT JOIN procesos p ON c.IDColaborador = p.IDColaboradorPropietario
        LEFT JOIN registros r ON p.IDProceso = r.IDProceso


        LEFT JOIN (
          SELECT
              p.IDColaboradorPropietario,
              COUNT(DISTINCT p.IDProceso) AS TicketsAsignados,
              sum(Monto) as MontoEdgar
          FROM
              procesos p
          WHERE
              DATE(p.FechaYHoraCreacion) BETWEEN '${FDesde}' AND '${FHasta}'
          GROUP BY
              p.IDColaboradorPropietario
      ) AS subquery ON c.IDColaborador = subquery.IDColaboradorPropietario



      left join 
    
    
    
      (SELECT 
         p.IDColaboradorPropietario,
             COUNT(DISTINCT p.IDProceso) AS TicketsActivos
     FROM
         procesos p 
     WHERE
          p.Estado=1 and ( DATE(p.FechaYHoraCreacion) BETWEEN '${FDesde}' AND '${FHasta}')
     GROUP BY p.IDColaboradorPropietario) AS Activos ON c.IDColaborador = Activos.IDColaboradorPropietario 
     
     
     left join
     
     
      (SELECT 
         p.IDColaboradorPropietario,
             COUNT(DISTINCT p.IDProceso) AS TicketsCulminados
     FROM
         procesos p
     WHERE
        p.Estado=2  and ( DATE(p.FechaYHoraCreacion) BETWEEN '${FDesde}' AND '${FHasta}')
     GROUP BY p.IDColaboradorPropietario) AS Culminados ON c.IDColaborador = Culminados.IDColaboradorPropietario 
     
     
      left join
     
     
      (SELECT 
         p.IDColaboradorPropietario,
             COUNT(DISTINCT p.IDProceso) AS TicketsCancelados
     FROM
         procesos p
     WHERE
        p.Estado=0  and ( DATE(p.FechaYHoraCreacion) BETWEEN '${FDesde}' AND '${FHasta}')
     GROUP BY p.IDColaboradorPropietario) AS Cancelados ON c.IDColaborador = Cancelados.IDColaboradorPropietario 
     
   
     



        `;

    const params = [];

    if (IDAgencia > 0 && IDAsesor > 0) {
      query +=
        " WHERE c.IDColaborador = ? AND p.IDAgencia = ?  and DATE(p.FechaYHoraCreacion) BETWEEN ? AND ? ";
      params.push(IDAsesor, IDAgencia, FDesde, FHasta);
    } else if (IDAgencia > 0) {
      query +=
        " WHERE p.IDAgencia = ?  and DATE(p.FechaYHoraCreacion) BETWEEN ? AND ? ";
      params.push(IDAgencia, FDesde, FHasta);
    } else if (IDAsesor > 0) {
      query +=
        " WHERE c.IDColaborador = ? and DATE(p.FechaYHoraCreacion) BETWEEN ? AND ? ";
      params.push(IDAsesor, FDesde, FHasta);
    } else {
      query += " WHERE DATE(p.FechaYHoraCreacion) BETWEEN ? AND ? ";
      params.push(FDesde, FHasta);
    }

    query +=
      " GROUP BY c.IDColaborador, c.Nombre, c.Telefono, subquery.TicketsAsignados, Activos.TicketsActivos, Culminados.TicketsCulminados,Cancelados.TicketsCancelados";

    const [RespuestaTiempoPromedioCulminacionYDataGeneral] =
      await poolDeConexiones.query(query, params);

    // Tiempo promedio entre cada registro de
    let query2 = `
    SELECT
    CONCAT(
        FLOOR(TotalSegundos / (24 * 3600)), ' días, ',
        FLOOR((TotalSegundos % (24 * 3600)) / 3600), ' horas, ',
        FLOOR((TotalSegundos % 3600) / 60), ' minutos'
    ) AS TiempoPromedio
FROM (
    SELECT
        AVG(TIMESTAMPDIFF(SECOND, FechaYHoraRegistroAnterior, FechaYHoraRegistro)) AS TotalSegundos
    FROM (
        SELECT
            registros.IDProceso,
            MotivoRegistro,
            FechaYHoraRegistro,
            registros.IDColaboradorPropietario,
            FechaYHoraCreacion,
            LAG(FechaYHoraRegistro) OVER (PARTITION BY IDProceso ORDER BY FechaYHoraRegistro) AS FechaYHoraRegistroAnterior
        FROM registros
        inner join procesos on registros.IDProceso = procesos.IDProceso
        WHERE MotivoRegistro IN ('Creación de Ticket', 'Avance de Ticket', 'Culminacion de Ticket')
    ) AS Temp
    WHERE MotivoRegistro != 'Creación de Ticket'
    `;

    const params2 = [];

    if (IDAsesor > 0) {
      query2 +=
        " and IDColaboradorPropietario = ? and DATE(FechaYHoraCreacion) BETWEEN ? AND ? ";
      params2.push(IDAsesor, FDesde, FHasta);
    } else {
      query2 += " and  DATE(FechaYHoraCreacion) BETWEEN ? AND ? ";
      params2.push(FDesde, FHasta);
    }

    query2 += " group by IDColaboradorPropietario ) AS Promedio";

    const [RespuestaTiempoPromedioEntreCadaRegistro] =
      await poolDeConexiones.query(query2, params2);

    let RespuestaReportePorAsesor = [];
    let iterador = 0;

    RespuestaTiempoPromedioCulminacionYDataGeneral.map((item) => {
      // console.log( RespuestaTiempoPromedioEntreCadaRegistro[iterador].TiempoPromedio || " ")

      item.TiempoPromedioEntreCadaRegistro =
        RespuestaTiempoPromedioEntreCadaRegistro[iterador]?.TiempoPromedio ??
        "";

      RespuestaReportePorAsesor.push(item);
      iterador = iterador + 1;
    });

    if (RespuestaReportePorAsesor.length > 0) {
      return {
        type: "success",
        message: "Reporte obtenido correctamente...",
        data: {
          RespuestaReportePorAsesor,
        },
      };
    } else {
      return {
        type: "danger",
        message: "No se encontraron resultados para su consulta...",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      type: "error",
      message: "Ocurrió un error al obtener el reporte general...",
      error: error.message,
    };
  }
};

export const consultarReportePorAsesorPorExcel = async (
  IDAgencia,
  FDesde,
  FHasta,
  IDAsesor
) => {
  try {
    // Para TIEMPO PROMEDIO DE CULMINACION
    let query = `
    SELECT
        c.IDColaborador AS 'ID Colaborador',
        c.Nombre AS 'Nombre de asesor',
        c.Telefono AS 'Telefono de colaborador',
        subquery.TicketsAsignados as 'Tickets asignados',
        Activos.TicketsActivos as 'Tickets activos',
        Culminados.TicketsCulminados as 'Tickets culminados',
        Cancelados.TicketsCancelados as 'Tickets cancelados',
        CONCAT(
            FLOOR(ABS(AVG(CASE WHEN r.MotivoRegistro = 'Culminacion de Ticket' THEN TIMESTAMPDIFF(DAY, p.FechaYHoraCreacion, r.FechaYHoraRegistro) END))), ' días, ',
            FLOOR(ABS(AVG(CASE WHEN r.MotivoRegistro = 'Culminacion de Ticket' THEN MOD(TIMESTAMPDIFF(HOUR, p.FechaYHoraCreacion, r.FechaYHoraRegistro), 24) END))), ' horas, ',
            FLOOR(ABS(AVG(CASE WHEN r.MotivoRegistro = 'Culminacion de Ticket' THEN TIMESTAMPDIFF(MINUTE, p.FechaYHoraCreacion, r.FechaYHoraRegistro) END))), ' minutos'
        ) AS 'Tiempo promedio de culminación'
    FROM
        colaborador c
        LEFT JOIN procesos p ON c.IDColaborador = p.IDColaboradorPropietario
        LEFT JOIN registros r ON p.IDProceso = r.IDProceso




        LEFT JOIN (
          SELECT
              p.IDColaboradorPropietario,
              COUNT(DISTINCT p.IDProceso) AS TicketsAsignados
          FROM
              procesos p
          WHERE
              DATE(p.FechaYHoraCreacion) BETWEEN '${FDesde}' AND '${FHasta}'
          GROUP BY
              p.IDColaboradorPropietario
      ) AS subquery ON c.IDColaborador = subquery.IDColaboradorPropietario



      left join 
    
    
    
      (SELECT 
         p.IDColaboradorPropietario,
             COUNT(DISTINCT p.IDProceso) AS TicketsActivos
     FROM
         procesos p
     WHERE
          p.Estado=1  and ( DATE(p.FechaYHoraCreacion) BETWEEN '${FDesde}' AND '${FHasta}')
     GROUP BY p.IDColaboradorPropietario) AS Activos ON c.IDColaborador = Activos.IDColaboradorPropietario 
     
     
     left join
     
     
      (SELECT 
         p.IDColaboradorPropietario,
             COUNT(DISTINCT p.IDProceso) AS TicketsCulminados
     FROM
         procesos p
     WHERE
        p.Estado=2  and ( DATE(p.FechaYHoraCreacion) BETWEEN '${FDesde}' AND '${FHasta}')
     GROUP BY p.IDColaboradorPropietario) AS Culminados ON c.IDColaborador = Culminados.IDColaboradorPropietario 
     
     
      left join
     
     
      (SELECT 
         p.IDColaboradorPropietario,
             COUNT(DISTINCT p.IDProceso) AS TicketsCancelados
     FROM
         procesos p
     WHERE
        p.Estado=0 and ( DATE(p.FechaYHoraCreacion) BETWEEN '${FDesde}' AND '${FHasta}')
     GROUP BY p.IDColaboradorPropietario) AS Cancelados ON c.IDColaborador = Cancelados.IDColaboradorPropietario 
     
     



        `;

    const params = [];

    if (IDAgencia > 0 && IDAsesor > 0) {
      query +=
        " WHERE c.IDColaborador = ? AND p.IDAgencia = ?  and DATE(p.FechaYHoraCreacion) BETWEEN ? AND ? ";
      params.push(IDAsesor, IDAgencia, FDesde, FHasta);
    } else if (IDAgencia > 0) {
      query +=
        " WHERE p.IDAgencia = ?  and DATE(p.FechaYHoraCreacion) BETWEEN ? AND ? ";
      params.push(IDAgencia, FDesde, FHasta);
    } else if (IDAsesor > 0) {
      query +=
        " WHERE c.IDColaborador = ? and DATE(p.FechaYHoraCreacion) BETWEEN ? AND ? ";
      params.push(IDAsesor, FDesde, FHasta);
    } else {
      query += " WHERE DATE(p.FechaYHoraCreacion) BETWEEN ? AND ? ";
      params.push(FDesde, FHasta);
    }

    query +=
      " GROUP BY c.IDColaborador, c.Nombre, c.Telefono, subquery.TicketsAsignados, Activos.TicketsActivos, Culminados.TicketsCulminados,Cancelados.TicketsCancelados";

    const [RespuestaTiempoPromedioCulminacionYDataGeneral] =
      await poolDeConexiones.query(query, params);

    // Tiempo promedio entre cada registro de
    let query2 = `
    SELECT
    CONCAT(
        FLOOR(TotalSegundos / (24 * 3600)), ' días, ',
        FLOOR((TotalSegundos % (24 * 3600)) / 3600), ' horas, ',
        FLOOR((TotalSegundos % 3600) / 60), ' minutos'
    ) AS TiempoPromedio
FROM (
    SELECT
        AVG(TIMESTAMPDIFF(SECOND, FechaYHoraRegistroAnterior, FechaYHoraRegistro)) AS TotalSegundos
    FROM (
        SELECT
            registros.IDProceso,
            MotivoRegistro,
            FechaYHoraRegistro,
            registros.IDColaboradorPropietario,
            FechaYHoraCreacion,
            LAG(FechaYHoraRegistro) OVER (PARTITION BY IDProceso ORDER BY FechaYHoraRegistro) AS FechaYHoraRegistroAnterior
        FROM registros
        inner join procesos on registros.IDProceso = procesos.IDProceso
        WHERE MotivoRegistro IN ('Creación de Ticket', 'Avance de Ticket', 'Culminacion de Ticket')
    ) AS Temp
    WHERE MotivoRegistro != 'Creación de Ticket'
    `;

    const params2 = [];

    if (IDAsesor > 0) {
      query2 +=
        " and IDColaboradorPropietario = ? and DATE(FechaYHoraCreacion) BETWEEN ? AND ? ";
      params2.push(IDAsesor, FDesde, FHasta);
    } else {
      query2 += " and  DATE(FechaYHoraCreacion) BETWEEN ? AND ? ";
      params2.push(FDesde, FHasta);
    }

    query2 += " group by IDColaboradorPropietario ) AS Promedio";

    const [RespuestaTiempoPromedioEntreCadaRegistro] =
      await poolDeConexiones.query(query2, params2);
    console.log(RespuestaTiempoPromedioEntreCadaRegistro);

    let RespuestaReportePorAsesor = [];
    let iterador = 0;

    RespuestaTiempoPromedioCulminacionYDataGeneral.map((item) => {
      item.TiempoPromedioEntreCadaRegistro =
        RespuestaTiempoPromedioEntreCadaRegistro[iterador]?.TiempoPromedio ??
        "";
      RespuestaReportePorAsesor.push(item);
      iterador = iterador + 1;
    });

    console.log(RespuestaReportePorAsesor);

    if (RespuestaReportePorAsesor.length > 0) {
      return {
        type: "success",
        message: "Reporte obtenido correctamente...",
        data: {
          RespuestaReportePorAsesor,
        },
      };
    } else {
      return {
        type: "danger",
        message: "No se encontraron resultados para su consulta...",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      type: "error",
      message: "Ocurrió un error al obtener el reporte general...",
      error: error.message,
    };
  }
};

// Para consultar el reporte general para GRAFICAS
export const consultarReporteParaGraficas = async (
  IDAgencia,
  FDesde,
  FHasta,
  IDAsesor
) => {
  try {
    /// -------------- Script de consulta para REPORTE GENERAL ------------
    let query = `
    SELECT l.IDLista, l.NombreLista, COALESCE(AVG(TiempoTranscurridoMinutos), 0) AS TiempoPromedioMinutos
    FROM listas l
    LEFT JOIN (
      SELECT IDRegistro, FechaYHoraRegistro, IDLista, IDProceso, FechaYHoraCreacion,
        COALESCE(TIMESTAMPDIFF(HOUR, FechaYHoraRegistroAnterior, FechaYHoraRegistro), 0) AS TiempoTranscurridoMinutos
      FROM (
        SELECT IDRegistro, FechaYHoraRegistro, IDLista, IDProceso, FechaYHoraCreacion,
          LAG(FechaYHoraRegistro) OVER (PARTITION BY IDProceso ORDER BY FechaYHoraRegistro) AS FechaYHoraRegistroAnterior
        FROM (
          SELECT r.IDRegistro, r.FechaYHoraRegistro, r.IDLista, p.IDProceso, p.FechaYHoraCreacion
          FROM registros r
          JOIN procesos p ON r.IDProceso = p.IDProceso
          WHERE r.MotivoRegistro IN ('Creación de Ticket', 'Avance de Ticket', 'Culminacion de Ticket' , 'Solicitud de cancelación de Ticket APROBADA')
           and
            (DATE(r.FechaYHoraRegistro) BETWEEN ? AND ?)



                    `;
    const params = [FDesde, FHasta];

    if (IDAgencia > 0 && IDAsesor > 0) {
      query += " AND p.IDAgencia = ? AND p.IDColaboradorPropietario = ? ";
      params.push(IDAgencia, IDAsesor);
    } else if (IDAgencia > 0) {
      query += " AND p.IDAgencia = ?";
      params.push(IDAgencia);
    } else if (IDAsesor > 0) {
      query += " AND r.IDColaboradorPropietario = ? ";
      params.push(IDAsesor);
    }

    query += `        ) AS subquery
      ) AS subquery2
  ) AS subquery3 ON l.IDLista = subquery3.IDLista
  GROUP BY l.IDLista, l.NombreLista
  ORDER BY l.IDLista;
  `;

    let [RespuestaReporteGeneral] = await poolDeConexiones.query(query, [
      ...params,
    ]);

    let volatil = RespuestaReporteGeneral;

    // Recorre la lista y reorganiza los valores de TiempoPromedioMinutos
    for (let i = 0; i < volatil.length - 1; i++) {
      const next = volatil[i + 1];

      volatil[i].TiempoPromedioMinutos = next.TiempoPromedioMinutos;
    }

    volatil.pop();
    RespuestaReporteGeneral = volatil;
    console.log(volatil);

    if (volatil.length > 0) {
      return {
        type: "success",
        message: "Reporte obtenido correctamente...",
        data: {
          RespuestaReporteGeneral,
        },
      };
    } else {
      return {
        type: "danger",
        message: "No se se encontraron resultados para su consulta...",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      type: "error",
      message: "Ocurrió un error al obtener el reporte general...M",
      error: error.message,
    };
  }
};

// Para consultar el reporte de la cantidad de tickets que se encuentran en cada una de las 6 fases ACTUALMENTE
export const consultarReporteCantidadTicketsPorFase = async (
  IDAgencia,
  IDAsesor
) => {
  try {
    /// -------------- Script de consulta para REPORTE GENERAL ------------
    let query = `
        SELECT 
        listas.IDLista,
        listas.NombreLista,
        IFNULL(COUNT(procesos.Ticket), 0) AS CantidadFase
    FROM
        listas
            LEFT JOIN
        procesos ON listas.IDLista = procesos.IDLista
    `;
    const params = [];

    if (IDAgencia > 0 && IDAsesor > 0) {
      query +=
        " AND procesos.IDAgencia = ? and procesos.IDColaboradorPropietario= ?  ";
      params.push(IDAgencia, IDAsesor);
    } else if (IDAgencia > 0) {
      query += "  and IDAgencia = ? ";
      params.push(IDAgencia);
    } else if (IDAsesor > 0) {
      query += " and procesos.IDColaboradorPropietario= ? ";
      params.push(IDAsesor);
    }

    query += `
    GROUP BY listas.IDLista , listas.NombreLista ORDER BY listas.IDLista ASC;

    `;

    let [RespuestaCantidades] = await poolDeConexiones.query(query, [
      ...params,
    ]);

    if (RespuestaCantidades.length > 0) {
      return {
        type: "success",
        message: "Reporte obtenido correctamente...",
        data: {
          RespuestaCantidades,
        },
      };
    } else {
      return {
        type: "danger",
        message: "No se se encontraron resultados para su consulta...",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      type: "error",
      message:
        "Ocurrió un error al obtener el reporte graficado de cantidades...M",
      error: error.message,
    };
  }
};

// Para consultar el listado de solicitudes de cancelacion que tenemos
export const consultarListadoDeSolicitudes = async (IDAgencia, IDAsesor) => {
  try {
    /// -------------- Script de consulta para REPORTE GENERAL ------------
    let query = `
    SELECT 
    IDSolicitud,
    DATE_FORMAT(FechaDeSolicitud, '%Y-%m-%d %H:%i:%s') AS FechaSolicitud,
    CASE
        WHEN EstadoSolicitud = 0 THEN 'Rechazado'
        WHEN EstadoSolicitud = 1 THEN 'Esperando'
        ELSE 'Aprobado'
    END AS Estado,
    agencias.NombreAgencia,
    colaborador.Nombre as Solicitante,
    procesos.NombreAsociado,  
    procesos.Ticket, 
    solicitudes.IDProceso
FROM
    solicitudes
        INNER JOIN
    agencias ON agencias.IDAgencia = solicitudes.IDAgencia
        INNER JOIN
    colaborador ON colaborador.IDColaborador = solicitudes.IDColaborador
        INNER JOIN
    procesos ON procesos.IDProceso = solicitudes.IDProceso 
    where solicitudes.EstadoSolicitud = 1 
    `;
    const params = [];

    if (IDAgencia > 0) {
      query += " AND solicitudes.IDAgencia = ?";
      params.push(IDAgencia);
    }

    if (IDAsesor > 0) {
      query += " AND solicitudes.IDColaborador = ? ";
      params.push(IDAsesor);
    }

    const [RespuestaReporteGeneral] = await poolDeConexiones.query(query, [
      ...params,
    ]);

    if (RespuestaReporteGeneral.length > 0) {
      return {
        type: "success",
        message: "Se han encontrado solicitudes de cancelación...",
        data: {
          RespuestaReporteGeneral,
        },
      };
    } else {
      return {
        type: "danger",
        message:
          "No se encontraron solicitudes de cancelación hasta el momento...",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      type: "error",
      message: "Ocurrió un error al obtener el reporte general...M",
      error: error.message,
    };
  }
};

// Funcion para aprobar la cancelacion de un tikcet
export const aprobarLaCancelacionDeUnTicket = async (
  IDTicket,
  IDColaborador
) => {
  try {
    const [RespuestaCambioEstadoSolicitud] = await poolDeConexiones.query(
      "UPDATE solicitudes set EstadoSolicitud = 2 where IDProceso = ?",
      [IDTicket]
    );

    const [RespuestaDeCambioDeEstadoTicket] = await poolDeConexiones.query(
      "UPDATE procesos set Estado = 0 where IDProceso = ?",
      [IDTicket]
    );

    const [ResultadoDataTicket] = await poolDeConexiones.query(
      "select * from procesos where IDProceso = ?",
      [IDTicket]
    );

    // Consultar los detalles que tiene el tickety actualmente para guardarlo en los registros de bitacora
    const [DataTicket] = await poolDeConexiones.query(
      "SELECT * from procesos where IDProceso = ?",
      [IDTicket]
    );

    const [ResultadoRespuestaRegistro] = await poolDeConexiones.query(
      "INSERT INTO registros (FechaYHoraRegistro,DetallesBitacora, MotivoRegistro, IDProceso, IDLista, IDColaborador, IDColaboradorPropietario) VALUES (now(),?,?,?,?,?,?)",
      [
        DataTicket[0].Detalles,
        "Solicitud de cancelación de Ticket APROBADA",
        IDTicket,
        ResultadoDataTicket[0].IDLista,
        IDColaborador,
        ResultadoDataTicket[0].IDColaboradorPropietario,
      ]
    );

    if (
      RespuestaCambioEstadoSolicitud.affectedRows > 0 &&
      RespuestaDeCambioDeEstadoTicket.affectedRows > 0 &&
      ResultadoDataTicket.length > 0 &&
      ResultadoRespuestaRegistro.affectedRows > 0
    ) {
      return {
        type: "success",
        message: "Cancelación de Ticket ¡Aprobado correctamente!...",
      };
    } else {
      return {
        type: "danger",
        message:
          "No se pudo terminar completamente el proceso de cancelación del Ticket...",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      type: "error",
      message: "Ocurrió un error al intentar cancelar el Ticket...M",
      error: error.message,
    };
  }
};

// Funcion para RECHAZAR la cancelacion de un tikcet
export const rechazarLaCancelacionDeUnTicket = async (
  IDTicket,
  IDColaborador
) => {
  try {
    const [RespuestaCambioEstadoSolicitud] = await poolDeConexiones.query(
      "UPDATE solicitudes set EstadoSolicitud = 0 where IDProceso = ?",
      [IDTicket]
    );

    const [ResultadoDataTicket] = await poolDeConexiones.query(
      "select * from procesos where IDProceso = ?",
      [IDTicket]
    );

    const [ResultadoRespuestaRegistro] = await poolDeConexiones.query(
      "INSERT INTO registros (FechaYHoraRegistro, DetallesBitacora, MotivoRegistro, IDProceso, IDLista, IDColaborador, IDColaboradorPropietario) VALUES (now(),?,?,?,?,?,?)",
      [
        ResultadoDataTicket[0].Detalles,
        "Solicitud de cancelación de Ticket RECHAZADA",
        IDTicket,
        ResultadoDataTicket[0].IDLista,
        IDColaborador,
        ResultadoDataTicket[0].IDColaboradorPropietario,
      ]
    );

    if (
      RespuestaCambioEstadoSolicitud.affectedRows > 0 &&
      ResultadoDataTicket.length > 0 &&
      ResultadoRespuestaRegistro.affectedRows > 0
    ) {
      return {
        type: "success",
        message: "Cancelación de Ticket ¡Rechazada correctamente!...",
      };
    } else {
      return {
        type: "danger",
        message:
          "No se pudo terminar completamente el proceso de RECHAZO de cancelación del Ticket...",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      type: "error",
      message:
        "Ocurrió un error al intentar RECHAZAR la solicitud de cancelación del Ticket...M",
      error: error.message,
    };
  }
};

// Para consultar el Trackeo del ticket
export const consultarTrackeoDeTicket = async (Ticket, DPI) => {
  try {
    /// -------------- Script de consulta para REPORTE GENERAL ------------
    let query = `
          SELECT 
          listas.IDLista,
          listas.NombreLista,
          COALESCE(DATE_FORMAT(registros.FechaYHoraRegistro,
                          '%Y-%m-%d %H:%i:%s'),
                  '') AS FechaYHoraRegistro,
          COALESCE(registros.MotivoRegistro, '') AS MotivoRegistro,
          CASE
              WHEN registros.IDProceso IS NOT NULL THEN TRUE
              ELSE FALSE
          END AS TieneRegistros
      FROM
          listas
              LEFT JOIN
          (SELECT 
              registros.IDLista,
                  registros.FechaYHoraRegistro,
                  registros.MotivoRegistro,
                  registros.IDProceso
          FROM
              registros
          INNER JOIN procesos ON procesos.IDProceso = registros.IDProceso
          WHERE
              (procesos.Ticket = ?
                  OR procesos.DPIAsociado = ?)
                  AND (registros.MotivoRegistro = 'Creación de Ticket'
                  OR registros.MotivoRegistro = 'Avance de Ticket'
                  OR registros.MotivoRegistro = 'Culminacion de Ticket')) AS registros ON listas.IDLista = registros.IDLista
                  ;
        
        
    `;
    const params = [];

    if (
      Ticket != "" &&
      Ticket != null &&
      Ticket != undefined &&
      Ticket != " "
    ) {
      params.push(Ticket);
    } else {
      params.push("");
    }

    if (DPI != "" && DPI != null && DPI != undefined && DPI != " ") {
      params.push(DPI);
    } else {
      params.push("");
    }

    const [HistorialTracking] = await poolDeConexiones.query(query, [
      ...params,
    ]);

    const [DataGeneralTiket] = await poolDeConexiones.query(
      `
          SELECT 
          procesos.Ticket,
          DATE_FORMAT(procesos.FechaYHoraCreacion,
                  '%Y-%m-%d %H:%i:%s') AS FechaYHoraCreacion,
          procesos.NombreAsociado,
          procesos.Detalles,
          CASE
              WHEN procesos.Estado = 1 THEN 'Activo'
              WHEN procesos.Estado = 2 THEN 'Culminado'
              WHEN procesos.Estado = 0 THEN 'Cancelado'
          END AS Estado,
          procesos.TelefonoAsociado,
          colaborador.Nombre,
          agencias.NombreAgencia
      FROM
          procesos
              INNER JOIN
          colaborador ON colaborador.IDColaborador = procesos.IDColaborador
          INNER JOIN
          agencias on agencias.IDAgencia = procesos.IDAgencia
      WHERE
          procesos.Ticket = ?
              OR procesos.DPIAsociado = ?
      LIMIT 1;

`,
      [...params]
    );

    if (HistorialTracking.length > 0 && DataGeneralTiket.length > 0) {
      return {
        type: "success",
        message: "Ticket encontrado satisfactoriamente...",
        data: {
          DataGeneralTiket,
          HistorialTracking,
        },
      };
    } else {
      return {
        type: "danger",
        message:
          "No se pudo encontrar el ticket solicitado, verifique los datos enviados...",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      type: "error",
      message: "Ocurrió un error al obtener el trackeo de ticket...M",
      error: error.message,
    };
  }
};
