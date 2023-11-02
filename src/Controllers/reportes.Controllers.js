import * as reportesModel from "../Models/reportes.Model.js";
import ExcelJS from "exceljs";
// Obtener colaboradores de agencia
export const getAgenciasYAsesores = async (req, res) => {
  try {

    const { IDAgencia } = req.params;
    //Consultamos los datos recibido en la base de datos
    const resuladoConsulta = await reportesModel.consultarAgenciasYAsesores(
      req.IDRol,
      req.IDAgencia,
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
      return res.status(500).json({
        type: resuladoConsulta.type,
        message: resuladoConsulta.message,
        error: resuladoConsulta.error,
      });
    }
  } catch (error) {
    return res.status(500).json({
      type: "error",
      message: "Ocurrió un error al validar su consulta con los datos enviados",
      error: error.message,
    });
  }
};

// Obtener reporte general
export const getReporteGeneralTickets = async (req, res) => {
  try {
    console.log("ID DE AGENCIA RECIBIDA ", req.params.IDAgencia);
    if (
      !req.params.IDAgencia ||
      !req.params.FDesde ||
      !req.params.FHasta ||
      !req.params.IDAsesor
    ) {
      return res.status(500).json({
        type: "error",
        message:
          "Todos los campos son requeridos en el parametro, por favor verifique que esten llenos y vuelva a intentarlo...",
      });
    } else {
      const { IDAgencia, FDesde, FHasta, IDAsesor } = req.params;

      console.log(req.IDRol);

      let IDAgenciaAMandar = 0;
      if (req.IDRol == 3) {
        IDAgenciaAMandar = req.IDAgencia;
      } else {
        IDAgenciaAMandar = IDAgencia;
      }

      //Consultamos los datos recibido en la base de datos
      const resuladoConsulta = await reportesModel.consultarReporteGeneral(
        IDAgenciaAMandar,
        FDesde,
        FHasta,
        IDAsesor
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
        return res.status(500).json({
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

// Obtener reporte general en Excel
export const getReporteGeneralEnExcel = async (req, res) => {
  try {
    if (
      !req.params.IDAgencia ||
      !req.params.FDesde ||
      !req.params.FHasta ||
      !req.params.IDAsesor
    ) {
      return res.json({
        type: "error",
        message:
          "Todos los campos son requeridos en el parámetro, por favor verifique que estén llenos y vuelva a intentarlo...",
      });
    } else {
      const { IDAgencia, FDesde, FHasta, IDAsesor } = req.params;

      let IDAgenciaAMandar = 0;
      if (req.IDRol == 3) {
        IDAgenciaAMandar = req.IDAgencia;
      } else {
        IDAgenciaAMandar = IDAgencia;
      }

      // Consultamos los datos recibidos en la base de datos
      const resultadoConsulta =
        await reportesModel.consultarReporteGeneralParaExcel(
          IDAgenciaAMandar,
          FDesde,
          FHasta,
          IDAsesor
        );

      // Verificamos si el resultado de la consulta es de tipo "success"
      if (resultadoConsulta.type == "success") {
        const dataParaGenerarExcel =
          resultadoConsulta.data.RespuestaReporteGeneral;

        //Obtener fecha
        const fecha = new Date(); // Obtener la fecha actual

        const anio = fecha.getFullYear(); // Obtener el año (ejemplo: 2023)
        const mes = fecha.getMonth() + 1; // Obtener el mes (tener en cuenta que los meses comienzan desde 0, por lo que se suma 1) (ejemplo: 7)
        const dia = fecha.getDate(); // Obtener el día (ejemplo: 11)
        const horas = fecha.getHours();
        const minutos = fecha.getMinutes();

        // Crear el string en el formato deseado: "YYYY-MM-DD"
        const fechaParseada = `${anio}-${mes.toString().padStart(2, "0")}-${dia
          .toString()
          .padStart(2, "0")}`;
        const FechaHoraExacta = `${anio}-${mes
          .toString()
          .padStart(2, "0")}-${dia.toString().padStart(2, "0")}   ${horas
          .toString()
          .padStart(2, "0")}:${minutos.toString().padStart(2, "0")}`;

        // Crear un nuevo workbook de Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Reporte general de Tickets");

        // Establecer el estilo del título
        const titleRow = worksheet.addRow(["Reporte general de Tickets"]);
        titleRow.font = { size: 14, bold: true };
        worksheet.addRow(["Fecha de generación: " + FechaHoraExacta]);
        worksheet.addRow([]); // Agregar una fila vacía para separar el título de los datos

        // Agregar encabezados de columnas y dar estilo
        const headers = Object.keys(dataParaGenerarExcel[0]);
        const headerRow = worksheet.addRow(headers);
        headerRow.font = { bold: true };
        headerRow.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "32E52E" }, // Verde pálido
        };

        // Agregar los datos al archivo Excel
        dataParaGenerarExcel.forEach((data) => {
          const row = [];
          for (const key in data) {
            row.push(data[key]);
          }
          worksheet.addRow(row);
        });

        // Establecer el ancho de las columnas para ajustarse al contenido
        worksheet.columns.forEach((column) => {
          if (column.header) {
            column.width =
              column.header.length < 12 ? 12 : column.header.length;
          } else {
            column.width = 12; // Valor predeterminado si no hay encabezado definido
          }
        });

        // Establecer el estilo de los bordes
        worksheet.eachRow((row) => {
          row.eachCell((cell) => {
            cell.border = {
              top: { style: "thin", color: { argb: "FF303030" } },
              left: { style: "thin", color: { argb: "FF303030" } },
              bottom: { style: "thin", color: { argb: "FF303030" } },
              right: { style: "thin", color: { argb: "FF303030" } },
            };
          });
        });

        // Configurar la respuesta HTTP para descargar el archivo Excel
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=Reporte_general_de_Tickets.xlsx"
        );

        // Enviar el archivo Excel como respuesta de la API
        return workbook.xlsx.write(res).then(() => {
          res.status(200).end();
        });
      } else {
        // Si el resultado de la consulta no es de tipo "success", retornar un mensaje de error
        return res.json({
          type: resultadoConsulta.type,
          message:
            "No se obtuvieron datos para cargar en el Excel, por lo que no se pudo generar...",
          error: resultadoConsulta.error,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      type: "error",
      message: "Ocurrió un error al generar su reporte en Excel",
      error: error.message,
    });
  }
};

// Obtener reporte de un ticket especifico
export const getReporteTicketEspecifico = async (req, res) => {
  try {
    if (
      !req.params.IDAgencia ||
      !req.params.Ticket ||
      !req.params.DPIAsociado
    ) {
      return res.status(500).json({
        type: "error",
        message:
          "Todos los campos son requeridos en el parametro, por favor verifique que esten llenos y vuelva a intentarlo...",
      });
    } else {
      const { IDAgencia, Ticket, DPIAsociado } = req.params;

      const ConsultaDeDataGeneralTicket =
        await reportesModel.consultarDataGeneralTicket(
          IDAgencia,
          Ticket,
          DPIAsociado
        );

      // Verificamos si el restulataod de la consulta es de tipo success
      if (ConsultaDeDataGeneralTicket.type == "success") {
        // Si se obtuvo resultados de la busqueda general de DATA GENRAL del ticket entonces procedemos a consusltar su historial
        let IDTicketEncontrado =
          ConsultaDeDataGeneralTicket.data.DataGeneralTicket[0].IDProceso;

        //Consultamos los datos recibido en la base de datos
        const resuladoConsulta =
          await reportesModel.consultarReporteDeUnTicketEspecifico(
            IDTicketEncontrado
          );

        return res.json({
          type: ConsultaDeDataGeneralTicket.type,
          message: ConsultaDeDataGeneralTicket.message,
          data: {
            DataGeneral: ConsultaDeDataGeneralTicket.data.DataGeneralTicket[0],
            HistorialParaTabla:
              resuladoConsulta.data.RespuestaReporteEspecifico,
          },
        });
      } else {
        //Si el resultado de la consulta no es de tipo success, retornamos un mensaje de error
        return res.status(500).json({
          type: ConsultaDeDataGeneralTicket.type,
          message: ConsultaDeDataGeneralTicket.message,
          error: ConsultaDeDataGeneralTicket.error,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      type: "error",
      message: "Ocurrió un error al validar su consulta con los datos enviados",
      error: error.message,
    });
  }
};

// Obtener reporte de un TIcket especifico en EXCEL
export const getReporteTicketEspecificoEnExcel = async (req, res) => {
  try {
    if (
      !req.params.IDAgencia ||
      !req.params.NombreAsociado ||
      !req.params.DPIAsociado
    ) {
      return res.status(500).json({
        type: "error",
        message:
          "Todos los campos son requeridos en el parametro, por favor verifique que esten llenos y vuelva a intentarlo...",
      });
    } else {
      const { IDAgencia, NombreAsociado, DPIAsociado } = req.params;

      const ConsultaDeDataGeneralTicket =
        await reportesModel.consultarDataGeneralTicket(
          IDAgencia,
          NombreAsociado,
          DPIAsociado
        );

      // Verificamos si el restulataod de la consulta es de tipo success
      if (ConsultaDeDataGeneralTicket.type == "success") {
        // Si se obtuvo resultados de la busqueda general de DATA GENRAL del ticket entonces procedemos a consusltar su historial
        let IDTicketEncontrado =
          ConsultaDeDataGeneralTicket.data.DataGeneralTicket[0].IDProceso;

        //Consultamos los datos recibido en la base de datos
        const resultadoConsulta =
          await reportesModel.consultarReporteDeUnTicketEspecificoExcel(
            IDTicketEncontrado
          );

        // Verificamos si el resultado de la consulta es de tipo "success"
        if (resultadoConsulta.type == "success") {
          const dataParaGenerarExcel =
            resultadoConsulta.data.RespuestaReporteEspecifico;

          //Obtener fecha
          const fecha = new Date(); // Obtener la fecha actual

          const anio = fecha.getFullYear(); // Obtener el año (ejemplo: 2023)
          const mes = fecha.getMonth() + 1; // Obtener el mes (tener en cuenta que los meses comienzan desde 0, por lo que se suma 1) (ejemplo: 7)
          const dia = fecha.getDate(); // Obtener el día (ejemplo: 11)
          const horas = fecha.getHours();
          const minutos = fecha.getMinutes();

          // Crear el string en el formato deseado: "YYYY-MM-DD"
          const fechaParseada = `${anio}-${mes
            .toString()
            .padStart(2, "0")}-${dia.toString().padStart(2, "0")}`;
          const FechaHoraExacta = `${anio}-${mes
            .toString()
            .padStart(2, "0")}-${dia.toString().padStart(2, "0")}   ${horas
            .toString()
            .padStart(2, "0")}:${minutos.toString().padStart(2, "0")}`;

          // Crear un nuevo workbook de Excel
          const workbook = new ExcelJS.Workbook();
          const worksheet = workbook.addWorksheet(
            "Reporte de un Ticket específico..."
          );

          // Establecer el estilo del título
          const titleRow = worksheet.addRow(["Reporte específico"]);
          titleRow.font = { size: 14, bold: true };
          worksheet.addRow(["Fecha de generación: " + FechaHoraExacta]);
          worksheet.addRow([]); // Agregar una fila vacía para separar el título de los datos

          // Agregar encabezados de columnas y dar estilo
          const headers = Object.keys(dataParaGenerarExcel[0]);
          const headerRow = worksheet.addRow(headers);
          headerRow.font = { bold: true };
          headerRow.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "32E52E" }, // Verde pálido
          };

          // Agregar los datos al archivo Excel
          dataParaGenerarExcel.forEach((data) => {
            const row = [];
            for (const key in data) {
              row.push(data[key]);
            }
            worksheet.addRow(row);
          });

          // Establecer el ancho de las columnas para ajustarse al contenido
          worksheet.columns.forEach((column) => {
            if (column.header) {
              column.width =
                column.header.length < 12 ? 12 : column.header.length;
            } else {
              column.width = 12; // Valor predeterminado si no hay encabezado definido
            }
          });

          // Establecer el estilo de los bordes
          worksheet.eachRow((row) => {
            row.eachCell((cell) => {
              cell.border = {
                top: { style: "thin", color: { argb: "FF303030" } },
                left: { style: "thin", color: { argb: "FF303030" } },
                bottom: { style: "thin", color: { argb: "FF303030" } },
                right: { style: "thin", color: { argb: "FF303030" } },
              };
            });
          });

          // Configurar la respuesta HTTP para descargar el archivo Excel
          res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          );
          res.setHeader(
            "Content-Disposition",
            "attachment; filename=Reporte_específico_de_Ticket.xlsx"
          );

          // Enviar el archivo Excel como respuesta de la API
          return workbook.xlsx.write(res).then(() => {
            res.status(200).end();
          });
        } else {
          // Si el resultado de la consulta no es de tipo "success", retornar un mensaje de error
          return res.status(500).json({
            type: resultadoConsulta.type,
            message:
              "No se obtuvieron datos para cargar en el Excel, por lo que no se pudo generar...",
            error: resultadoConsulta.error,
          });
        }
      } else {
        //Si el resultado de la consulta no es de tipo success, retornamos un mensaje de error
        return res.status(500).json({
          type: ConsultaDeDataGeneralTicket.type,
          message: ConsultaDeDataGeneralTicket.message,
          error: ConsultaDeDataGeneralTicket.error,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      type: "error",
      message:
        "Ocurrió un error al validar su consulta con los datos enviados y generar el excel. C",
      error: error.message,
    });
  }
};

// Obtener reporte por asesor de TICKETS
export const getReportePorAsesorTickets = async (req, res) => {
  try {
    if (
      !req.params.IDAgencia ||
      !req.params.FDesde ||
      !req.params.FHasta ||
      !req.params.IDAsesor
    ) {
      return res.status(500).json({
        type: "error",
        message:
          "Todos los campos son requeridos en el parametro, por favor verifique que esten llenos y vuelva a intentarlo...",
      });
    } else {
      const { IDAgencia, FDesde, FHasta, IDAsesor } = req.params;

      let IDAgenciaAMandar = 0;
      if (req.IDRol == 3) {
        IDAgenciaAMandar = req.IDAgencia;
      } else {
        IDAgenciaAMandar = IDAgencia;
      }

      //Consultamos los datos recibido en la base de datos
      const resuladoConsulta = await reportesModel.consultarReportePorAsesor(
        IDAgenciaAMandar,
        FDesde,
        FHasta,
        IDAsesor
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
        return res.status(500).json({
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
      message: "Ocurrió un error al validar su consulta con los datos enviados",
      error: error.message,
    });
  }
};

// Obtener reporte por asesor de TICKETS en EXCEL
export const getReportePorAsesorTicketsEnExcel = async (req, res) => {
  try {
    if (
      !req.params.IDAgencia ||
      !req.params.FDesde ||
      !req.params.FHasta ||
      !req.params.IDAsesor
    ) {
      return res.status(500).json({
        type: "error",
        message:
          "Todos los campos son requeridos en el parametro, por favor verifique que esten llenos y vuelva a intentarlo...",
      });
    } else {
      const { IDAgencia, FDesde, FHasta, IDAsesor } = req.params;

      //Consultamos los datos recibido en la base de datos
      const resuladoConsulta =
        await reportesModel.consultarReportePorAsesorPorExcel(
          IDAgencia,
          FDesde,
          FHasta,
          IDAsesor
        );

      // Verificamos si el restulataod de la consulta es de tipo success
      if (resuladoConsulta.type == "success") {
        const dataParaGenerarExcel =
          resuladoConsulta.data.RespuestaReportePorAsesor;

        //Obtener fecha
        const fecha = new Date(); // Obtener la fecha actual

        const anio = fecha.getFullYear(); // Obtener el año (ejemplo: 2023)
        const mes = fecha.getMonth() + 1; // Obtener el mes (tener en cuenta que los meses comienzan desde 0, por lo que se suma 1) (ejemplo: 7)
        const dia = fecha.getDate(); // Obtener el día (ejemplo: 11)
        const horas = fecha.getHours();
        const minutos = fecha.getMinutes();

        // Crear el string en el formato deseado: "YYYY-MM-DD"
        const fechaParseada = `${anio}-${mes.toString().padStart(2, "0")}-${dia
          .toString()
          .padStart(2, "0")}`;
        const FechaHoraExacta = `${anio}-${mes
          .toString()
          .padStart(2, "0")}-${dia.toString().padStart(2, "0")}   ${horas
          .toString()
          .padStart(2, "0")}:${minutos.toString().padStart(2, "0")}`;

        // Crear un nuevo workbook de Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(
          "Reporte de tickets por asesores..."
        );

        // Establecer el estilo del título
        const titleRow = worksheet.addRow(["Reporte por asesores..."]);
        titleRow.font = { size: 14, bold: true };
        worksheet.addRow(["Fecha de generación: " + FechaHoraExacta]);
        worksheet.addRow([]); // Agregar una fila vacía para separar el título de los datos

        // Agregar encabezados de columnas y dar estilo
        const headers = Object.keys(dataParaGenerarExcel[0]);
        const headerRow = worksheet.addRow(headers);
        headerRow.font = { bold: true };
        headerRow.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "32E52E" }, // Verde pálido
        };

        // Agregar los datos al archivo Excel
        dataParaGenerarExcel.forEach((data) => {
          const row = [];
          for (const key in data) {
            row.push(data[key]);
          }
          worksheet.addRow(row);
        });

        // Establecer el ancho de las columnas para ajustarse al contenido
        worksheet.columns.forEach((column) => {
          if (column.header) {
            column.width =
              column.header.length < 12 ? 12 : column.header.length;
          } else {
            column.width = 12; // Valor predeterminado si no hay encabezado definido
          }
        });

        // Establecer el estilo de los bordes
        worksheet.eachRow((row) => {
          row.eachCell((cell) => {
            cell.border = {
              top: { style: "thin", color: { argb: "FF303030" } },
              left: { style: "thin", color: { argb: "FF303030" } },
              bottom: { style: "thin", color: { argb: "FF303030" } },
              right: { style: "thin", color: { argb: "FF303030" } },
            };
          });
        });

        // Configurar la respuesta HTTP para descargar el archivo Excel
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=Reporte_de_tickets_por_asesores.xlsx"
        );

        // Enviar el archivo Excel como respuesta de la API
        return workbook.xlsx.write(res).then(() => {
          res.status(200).end();
        });
      } else {
        //Si el resultado de la consulta no es de tipo success, retornamos un mensaje de error
        return res.status(500).json({
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

// Obtener reporte general y resumido para GRAFICAS
export const getReporteParaGraficas = async (req, res) => {
  try {
    if (
      !req.params.IDAgencia ||
      !req.params.FDesde ||
      !req.params.FHasta ||
      !req.params.IDAsesor
    ) {
      return res.status(500).json({
        type: "error",
        message:
          "Todos los campos son requeridos en el parametro, por favor verifique que esten llenos y vuelva a intentarlo...",
      });
    } else {
      const { IDAgencia, FDesde, FHasta, IDAsesor } = req.params;

      let IDAgenciaAMandar = 0;
      if (req.IDRol == 3) {
        IDAgenciaAMandar = req.IDAgencia;
      } else {
        IDAgenciaAMandar = IDAgencia;
      }

      //Consultamos los datos recibido en la base de datos
      const resuladoConsulta = await reportesModel.consultarReporteParaGraficas(
        IDAgenciaAMandar,
        FDesde,
        FHasta,
        IDAsesor
      );
      const resultadoConsultaCantidades = await reportesModel.consultarReporteCantidadTicketsPorFase(
        IDAgenciaAMandar,
        IDAsesor
      );

      // Verificamos si el restulataod de la consulta es de tipo success
      if (resuladoConsulta.type == "success" && resultadoConsultaCantidades.type == "success") {
        return res.json({
          type: resuladoConsulta.type,
          message: resuladoConsulta.message,
          data: resuladoConsulta.data,
          dataCantidades: resultadoConsultaCantidades.data,
        });
      } else {
        //Si el resultado de la consulta no es de tipo success, retornamos un mensaje de error
        return res.status(500).json({
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

// Obtener el listado de solicitudes de cancelacion de tickets
export const getListadoDeSolicitudes = async (req, res) => {
  try {
    if (!req.params.IDAgencia || !req.params.IDAsesor) {
      return res.status(500).json({
        type: "error",
        message:
          "Todos los campos son requeridos en el parametro, por favor verifique que esten llenos y vuelva a intentarlo...",
      });
    } else {
      let IDAgenciaAMandar = 0;
      const { IDAgencia, IDAsesor } = req.params;

      if (req.IDRol == 3) {
        IDAgenciaAMandar = req.IDAgencia;
      } else {
        IDAgenciaAMandar = IDAgencia;
      }

      //Consultamos los datos recibido en la base de datos
      const resuladoConsulta =
        await reportesModel.consultarListadoDeSolicitudes(
          IDAgenciaAMandar,
          IDAsesor
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

// Para APROBAR la cancelacion de un tikcet
export const getAprobarCancelacionTicket = async (req, res) => {
  try {
    if (!req.params.IDTicket) {
      return res.json({
        type: "error",
        message:
          "Todos los campos son requeridos en el parametro, por favor verifique que esten llenos y vuelva a intentarlo...",
      });
    } else {
      const { IDTicket } = req.params;
      const IDColaborador = req.IDColaborador;

      //Consultamos los datos recibido en la base de datos
      const resuladoConsulta =
        await reportesModel.aprobarLaCancelacionDeUnTicket(
          IDTicket,
          IDColaborador
        );

      // Verificamos si el restulataod de la consulta es de tipo success
      if (resuladoConsulta.type == "success") {
        return res.json({
          type: resuladoConsulta.type,
          message: resuladoConsulta.message,
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

// Para RECHAZAR la cancelacion de un tikcet
export const getRechazarCancelacionTicket = async (req, res) => {
  try {
    if (!req.params.IDTicket) {
      return res.json({
        type: "error",
        message:
          "Todos los campos son requeridos en el parametro, por favor verifique que esten llenos y vuelva a intentarlo...",
      });
    } else {
      const { IDTicket } = req.params;
      const IDColaborador = req.IDColaborador;

      //Consultamos los datos recibido en la base de datos
      const resuladoConsulta =
        await reportesModel.rechazarLaCancelacionDeUnTicket(
          IDTicket,
          IDColaborador
        );

      // Verificamos si el restulataod de la consulta es de tipo success
      if (resuladoConsulta.type == "success") {
        return res.json({
          type: resuladoConsulta.type,
          message: resuladoConsulta.message,
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

// Obtener Trackeo de tickets
export const getTrackeoTicket = async (req, res) => {
  try {
    if (!req.params.Ticket && !req.params.DPI) {
      return res.status(500).json({
        type: "error",
        message:
          "Todos los campos son requeridos en el parametro, por favor verifique que esten llenos y vuelva a intentarlo...",
      });
    } else {
      const { Ticket, DPI } = req.params;

      //Consultamos los datos recibido en la base de datos
      const resuladoConsulta = await reportesModel.consultarTrackeoDeTicket(
        Ticket.replace(" ", ""),
        DPI.replace(" ", "")
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
