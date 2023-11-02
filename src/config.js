import {
    config
} from 'dotenv';
config(); // Cargará las variables de entorno del archivo .env en process.env

console.log(process.env.SERVER_URL); // Acceso a la variable de entorno cargada desde .env

// Configuraciones gnerales del servidor
export let SERVER_URL = process.env.SERVER_URL;
export const PORT = process.env.PORT;
export let HOSTDB = process.env.HOSTDB;
export let PORTDB = process.env.PORTDB;
export let USERDB = process.env.USERDB;
export let PASSWORDDB = process.env.PASSWORDDB;
export let NAMEDB = process.env.NAMEDB;
export let SecretToken = process.env.SECRET_TOCKEN;
export let FRONTEND_URL = process.env.FRONTEND_URL;


if (process.env.ENTORNO == "production") {

    console.log("++++++PRODUCTION++++++++");

} else {

    console.log("++++++DEVELOPMENT++++++++");
}