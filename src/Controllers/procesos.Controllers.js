import * as procesoModel from "../Models/procesos.Model.js";
// Importamos axios


// Obtener servicios y area para sla craicon de ticket
export const getServiceArea = async (req, res) => {
    try {
        if (!req.params.IDArea) {
            return res.status(500).json({
                type: "error",
                message: "Todos los campos son requeridos en el parametro, por favor verifique que esten llenos y vuelva a intentarlo...",
            });
        } else {
            const {
                IDArea
            } = req.params;

            //Consultamos los datos recibido en la base de datos
            const resuladoConsulta = await procesoModel.ConsultarServiciosAgencia(
                IDArea
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
            message: "Ocurrió un error al validar su consulta con los datos de la agencia enviada",
            error: error.message,
        });
    }
};

// Datos necesarios para la generacion de tickets
export const getDataCreacionTicket = async (req, res) => {
    try {
        const IDAgencia = req.IDAgencia;
        const IDRol = req.IDRol;
        //Consultamos los datos recibido en la base de datos
        const resuladoConsulta = await procesoModel.getDataCreacionTicketModel(
            IDAgencia,
            IDRol
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

//Para la creacion de un NUEVO TICKET
export const postGenerarTicket = async (req, res) => {
    try {
        console.log(req.body);
        //Validamos si en en el body de la peticion vienen los datos requeridos y validmaos que no esten vacios
        if (
            !req.body.FechaVencimiento ||
            !req.body.Descripcion
        ) {
            return res.status(500).json({
                type: "error",
                message: "Todos los campos son requeridos, por favor verifique que esten llenos y vuelva a intentarlo...",
            });
        } else {
            //Si todos los campos estan llenos, continuamos con el registro
            const {
                FechaVencimiento,
                Descripcion
            } = req.body; //Obtenemos los datos que nos llegan en el body de la peticion

            //Variables necesarias para generar Tarea
            let NuevoNumeroDeTicketGenerado = null;
            let AcronimoServicio = "TASK";
            let AcronimoMasNumeroTicketGenerado = null;
            let MotivoDeRegistro = "Creación de Tarea";
            let NombreServicio = "";

            // Consultamos el ultimo numero de ticket generado
            const UltimoTicket =
                await procesoModel.ConsultarUltimoNumeroDeTicketGenerado();
            // Generamos nuevo número de ticket
            if (UltimoTicket.data[0].UltimoNoTicket == null) {
                NuevoNumeroDeTicketGenerado = 1;
            } else {
                NuevoNumeroDeTicketGenerado =
                    parseInt(UltimoTicket.data[0].UltimoNoTicket) + 1;
            }


            AcronimoMasNumeroTicketGenerado =
                AcronimoServicio + "-" + NuevoNumeroDeTicketGenerado;


            const RespuestaDeGeneracionDeTicket = await procesoModel.GenerarTicket(
                NuevoNumeroDeTicketGenerado,
                AcronimoMasNumeroTicketGenerado,
                FechaVencimiento,
                Descripcion,
                req.IDEstudiante,
                MotivoDeRegistro,
            );

            // Verificamos si el restulataod de la consulta es de tipo success
            if (RespuestaDeGeneracionDeTicket.type == "success") {
                // Llamado a metodo de envio de mensaje con parametros estriactos de envio

                try {


                } catch (error) {
                    console.log(
                        "*********************************************************************************************"
                    );
                    console.log("Ocurrio un error al enviar el mensaje de texto");
                    console.log(error);
                    console.log(
                        "*********************************************************************************************"
                    );
                }

                return res.json({
                    type: RespuestaDeGeneracionDeTicket.type, //success
                    message: RespuestaDeGeneracionDeTicket.message,
                    data: RespuestaDeGeneracionDeTicket.data,
                });
            } else {
                //Si el resultado de la consulta no es de tipo success, retornamos un mensaje de error
                return res.json({
                    type: RespuestaDeGeneracionDeTicket.type,
                    message: RespuestaDeGeneracionDeTicket.message,
                    error: RespuestaDeGeneracionDeTicket.error,
                });
            }
        }
    } catch (error) {
        return res.status(500).json({
            type: "error",
            message: "Ocurrió un error al validar su consulta con los datos.",
            error: error.message,
        });
    }
};

// Obtener puestos de una agencia mediante su ID
export const getDatosCreacionColaborador = async (req, res) => {
    try {
        //Consultamos los datos recibido en la base de datos
        const resuladoConsulta =
            await procesoModel.consultaParaAreaPuestoAgencias();

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
            return res.status(500).json({
                type: resuladoConsulta.type,
                message: resuladoConsulta.message,
                error: resuladoConsulta.error,
            });
        }
    } catch (error) {
        return res.status(500).json({
            type: "error",
            message: "Ocurrió un error al validar su consulta, error al controlador...",
            error: error.message,
        });
    }
};