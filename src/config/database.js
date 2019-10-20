module.exports = {
  dialect: 'postgres',
  host: 'localhost',
  username: 'postgres',
  password: 'docker',
  database: 'gymPointDB',
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};
