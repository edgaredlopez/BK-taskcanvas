import {
    poolDeConexiones
} from "../database/db.js";
import moment from "moment";



//Para consulta de Nombre de agencia por IDAgencia
export const getDataCreacionTicketModel = async (IDAgencia, IDRol) => {
    try {
        /// --------------NOmbre de agencia ------------
        const [NombreAgencia] = await poolDeConexiones.query(
            "SELECT NombreAgencia from agencias where IDAgencia=?",
            [IDAgencia]
        );

        // ---------SERVICIOS------------
        const [JSONServicios] = await poolDeConexiones.query(
            "SELECT IDServicio, NombreServicio from servicios where IDAgencia=?",
            [IDAgencia]
        );
        // Convertimos el JSON en un array asociativo
        const Servicios = JSONServicios.map((item) => ({
            [item.IDServicio]: item.NombreServicio,
        }));

        // Agregar el dato al principio del array
        Servicios.unshift({
            0: "Seleccione un servicio"
        });

        // --------------Asesores --------------------------------
        const [JSONAsesores] = await poolDeConexiones.query(
            "SELECT IDColaborador, Nombre FROM colaborador where Estado = 1 and IDRol= 6 and IDAgencia= '" +
            IDAgencia +
            "' and SiglasPuesto = 'ADC'  ORDER BY Nombre ASC"
        );
        //Concertimos el JSON en un array asociativo
        const Asesores = JSONAsesores.map((item) => ({
            [item.IDColaborador]: item.Nombre,
        }));

        // Agregar el dato al principio del array
        Asesores.unshift({
            0: "Seleccione un asesor"
        });

        if (
            NombreAgencia.length > 0 &&
            JSONServicios.length > 0 &&
            JSONAsesores.length > 0
        ) {
            return {
                type: "success",
                message: "Datos obtenidos correctamente...",
                data: {
                    NombreAgencia: NombreAgencia[0].NombreAgencia,
                    Servicios,
                    Asesores,
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
            message: "Ocurrió un error al validar su consulta con los datos enviados...",
            error: error.message,
        };
    }
};

//Para Ultimo numero de ticket generado por agencia
export const ConsultarUltimoNumeroDeTicketGenerado = async () => {
    try {
        const [resultado] = await poolDeConexiones.query(
            "select max(NumeroDeTarea) UltimoNoTicket from tareas"
        );
        if (resultado.length > 0) {
            return {
                type: "success",
                message: "Último No de ticket encontrado correctamente...",
                data: resultado,
            };
        } else {
            return {
                type: "error",
                message: "No se pudo encontrar ningun resultado para la busqueda...",
            };
        }
    } catch (error) {
        return {
            type: "error",
            message: "Ocurrió un error al validar su consulta con los datos",
            error: error.message,
        };
    }
};

//Para consultar detalles de un servicio
export const ConsultarDetallesDeServicio = async (IDServicio) => {
    try {
        const [resultado] = await poolDeConexiones.query(
            "select * from servicios where IDServicio = ?",
            [IDServicio]
        );
        if (resultado.length > 0) {
            return {
                type: "success",
                message: "Se encontró exitosamente los datos sobre el servicio solicitado...",
                data: resultado,
            };
        } else {
            return {
                type: "danger",
                message: "No se pudo encontrar ningun resultado para la busqueda...",
            };
        }
    } catch (error) {
        return {
            type: "error",
            message: "Ocurrió un error al validar su consulta con los datos",
            error: error.message,
        };
    }
};

//Para la creación de TICKETS
export const GenerarTicket = async (
    NuevoNumeroDeTicketGenerado,
    AcronimoMasNumeroTicketGenerado,
    FechaVencimiento,
    Descripcion,
    IDEstudiante,
    MotivoDeRegistro
) => {
    try {
        const [resultadoCreacionTicket] = await poolDeConexiones.query(
            "INSERT INTO tareas (NumeroDeTarea, TareaIdentificador, FechaYHoraCreacion,FechaYHoraDeVencimiento, Descripcion, IDEstudiante, IDLista) VALUES (?,?,now(),?,?,?,?)",
            [
                NuevoNumeroDeTicketGenerado,
                AcronimoMasNumeroTicketGenerado,
                FechaVencimiento,
                Descripcion,
                IDEstudiante,
                1,
            ]
        );

        if (resultadoCreacionTicket.affectedRows > 0) {
            let IDTicketRegistrado = resultadoCreacionTicket.insertId;



            // Consultar los detalles que tiene el tickety actualmente para guardarlo en los registros de bitacora
            const [DataTicket] = await poolDeConexiones.query(
                "SELECT * from tareas where IDTarea = ?", [IDTicketRegistrado]
            );



            const [resultadoCreacionDeHistorial] = await poolDeConexiones.query(
                "INSERT INTO registros (FechaYHoraRegistro,MotivoRegistro, IDTarea, IDLista, IDEstudiante) VALUES (now(),?,?,?,?)",
                [MotivoDeRegistro, IDTicketRegistrado, 1, IDEstudiante]
            );

            if (resultadoCreacionDeHistorial.affectedRows > 0) {

                return {
                    type: "success",
                    message: "Tarea generada correctamente...",

                };
            } else {
                return {
                    type: "error",
                    message: "No pudimos registrar el historial de la Tarea correctamente, hemos cancelado el proceso. Por favor vuelva a intentarlo...",
                };
            }
        } else {
            return {
                type: "error",
                message: "No pudimos registrar de la Tarea correctamente, hemos cancelado el proceso. Por favor vuelva a intentarlo...",
            };
        }
    } catch (error) {
        console.log(error);
        return {
            type: "error",
            message: "Ocurrió un error al intentar registrar la Tarea, por favor contacte al area de informática",
            error: error.message,
        };
    }
};

// Consultar datos para generar tikcet
export const ConsultarDatosParaGenerarTicket = async (IDTicket) => {
    try {
        const [resultado] = await poolDeConexiones.query(
            `SELECT procesos.Ticket, 
      TRIM(SUBSTRING_INDEX(procesos.NombreAsociado, ' ', 2)) AS NombreAsociado,
        min(registros.FechaYHoraRegistro) as Fecha, 
        TRIM(SUBSTRING_INDEX(colaborador.Nombre, ' ', 3)) AS Nombre,
        colaborador.Telefono as TelefonoAsesor,
        servicios.NombreServicio, 
        agencias.IDAgencia as IDPAR, 
        (SELECT TRIM(SUBSTRING_INDEX(Nombre, ' ', 2)) AS NombreJefeDeAgencia FROM colaborador WHERE IDAgencia = IDPAR AND SiglasPuesto = 'JDA') as NombreJefeDeAgencia,
        (SELECT Telefono  FROM colaborador WHERE IDAgencia = IDPAR AND SiglasPuesto = 'JDA') as  TelJefeAgencia
        from procesos  
        inner join registros on registros.IDProceso = procesos.IDProceso  
        inner join colaborador on colaborador.IDColaborador = procesos.IDColaboradorPropietario 
        inner join servicios on servicios.IDServicio = procesos.IDServicio 
        inner join agencias on agencias.IDAgencia = colaborador.IDAgencia 
        where procesos.IDProceso=?`,
            [IDTicket]
        );
        if (resultado.length > 0) {
            return {
                type: "success",
                message: "Datos de ticket encontrados satisfactoriamente...",
                data: resultado,
            };
        } else {
            return {
                type: "error",
                message: "No se pudieron encontrar los datos del ticket indicado...",
            };
        }
    } catch (error) {
        return {
            type: "error",
            message: "Ocurrió un error al validar su consulta con los datos del ticket...",
            error: error.message,
        };
    }
};

//Para consultar los puestos de una agencia mediante el ID
export const consultaParaAreaPuestoAgencias = async () => {
    try {


        // ---------ROLES------------
        const [JSONRoles] = await poolDeConexiones.query(
            "SELECT IDRol, NombreRol from roles"
        );
        // Convertimos el JSON en un array asociativo
        const Roles = JSONRoles.map((item) => ({
            [item.IDRol]: item.NombreRol,
        }));
        // Agregar el dato al principio del array
        Roles.unshift({
            0: "Seleccione un rol"
        });



        if (
            JSONRoles.length > 0
        ) {
            return {
                type: "success",
                message: "Datos obtenidos correctamente...",
                data: {
                    Roles,
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
            message: "Ocurrió un error al validar su consulta con los datos enviados...",
            error: error.message,
        };
    }
};