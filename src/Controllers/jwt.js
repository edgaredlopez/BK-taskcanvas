import jwt from "jsonwebtoken";
import { SecretToken } from "../config.js";

export async function  createAccessToken(payload) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      SecretToken,
      {
        expiresIn: 60 * 60 * 10, //Expira en 10 horas
      },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    );
  });F
}
