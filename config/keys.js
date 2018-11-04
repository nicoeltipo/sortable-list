const connectionData = {
  host: "mongodb",
  port: "27017",
  db: "sortableList"
};
module.exports = {
  mongoURI: `mongodb://${connectionData.host}:${connectionData.port}/${
    connectionData.db
  }`
};
