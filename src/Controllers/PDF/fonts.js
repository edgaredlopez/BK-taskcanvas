module.exports = {
  Roboto: {
    normal: Buffer.from(
      require("pdfmake/build/vfs_fonts.js").pdfMake.vfs["Roboto-Regular.ttf"],
      "base64"
    ), // Ruta al archivo de fuente Roboto normal
  },
};
