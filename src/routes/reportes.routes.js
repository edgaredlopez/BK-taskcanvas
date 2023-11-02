import { Router } from "express";
import * as ReportesController from "../Controllers/reportes.Controllers.js";
import {authRequire} from "../middlewares/validateToken.js";


const prefijoDeApi = "/api";
const routerReportes = Router();

//EndPoints
routerReportes.get(
  prefijoDeApi + "/getAgenciasYAsesores/:IDAgencia", authRequire,
  ReportesController.getAgenciasYAsesores
);
routerReportes.get(
  prefijoDeApi +
    "/getReporteGeneralTickets/:IDAgencia/:FDesde/:FHasta/:IDAsesor", authRequire, 
  ReportesController.getReporteGeneralTickets
);
routerReportes.get(
  prefijoDeApi +
    "/getReporteGeneralEnExcel/:IDAgencia/:FDesde/:FHasta/:IDAsesor", authRequire, 
  ReportesController.getReporteGeneralEnExcel
);

routerReportes.get(
  prefijoDeApi +
    "/getReporteTicketEspecifico/:IDAgencia/:Ticket/:DPIAsociado", authRequire,
  ReportesController.getReporteTicketEspecifico
);

routerReportes.get(
  prefijoDeApi +
    "/getReporteTicketEspecificoEnExcel/:IDAgencia/:NombreAsociado/:DPIAsociado", authRequire, 
  ReportesController.getReporteTicketEspecificoEnExcel
);




routerReportes.get(
  prefijoDeApi +
    "/getReportePorAsesorTickets/:IDAgencia/:FDesde/:FHasta/:IDAsesor", authRequire, 
  ReportesController.getReportePorAsesorTickets
);

routerReportes.get(
  prefijoDeApi +
    "/getReportePorAsesorTicketsEnExcel/:IDAgencia/:FDesde/:FHasta/:IDAsesor", authRequire, 
  ReportesController.getReportePorAsesorTicketsEnExcel
);



routerReportes.get(
  prefijoDeApi +
    "/getReporteParaGraficas/:IDAgencia/:FDesde/:FHasta/:IDAsesor", authRequire, 
  ReportesController.getReporteParaGraficas
);

// Para obtener el listado de solicitudes
routerReportes.get(
  prefijoDeApi +
    "/getSolicitudesDeCancelacion/:IDAgencia/:IDAsesor", authRequire, 
  ReportesController.getListadoDeSolicitudes
);

// Para APROBAR la cancelacion de un Ticket
routerReportes.get(
  prefijoDeApi +
    "/getAprobarCancelacionTicket/:IDTicket", authRequire, 
  ReportesController.getAprobarCancelacionTicket
);


// Para RECHAZAR la cancelacion de un Ticket
routerReportes.get(
  prefijoDeApi +
    "/getRechazarCancelacionTicket/:IDTicket", authRequire, 
  ReportesController.getRechazarCancelacionTicket
);


// Para consultar ESTADO DE TICKET, TRACKEO
routerReportes.get(
  prefijoDeApi +
    "/getTrackeo/:Ticket/:DPI", authRequire, 
    ReportesController.getTrackeoTicket
);


export default routerReportes;
