module.exports = {
  apps: [
    {
      name: 'procredit',
      script: 'index.js', // Nombre de tu archivo principal de la aplicación backend
      watch: false,
      ignore_watch: ['public'], // Aquí se especifica la carpeta que se debe ignorar
      watch_options: {
        followSymlinks: false,
      },
    },
  ],
};
