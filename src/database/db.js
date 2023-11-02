import {
    createPool
} from "mysql2/promise"; //Se importa el paquete de mysql2 para crear el pool de conexiones
//COnfiguraciones
import {
    HOSTDB,
    PORTDB,
    USERDB,
    PASSWORDDB,
    NAMEDB
} from "../config.js";

//Aqui se crea la conexión a la base de datos con el pool de conexiones
export const poolDeConexiones = createPool({
    host: HOSTDB,
    port: PORTDB,
    user: USERDB,
    password: PASSWORDDB,
    database: NAMEDB
});