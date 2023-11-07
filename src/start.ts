import { Db, MongoClient } from 'mongodb';
import smacker from  "smacker";
import app from "./app";
import config from 'config';

(async function() {
  const mongoClient = new MongoClient(config.get("mongodb.url"));
  await mongoClient.connect();
  const db:Db = mongoClient.db(config.get("mongodb.db"));

  const server = await app(db);
  let service;
  smacker.start({
      start: () => {
        service = server.listen(config.get('port'), '0.0.0.0');
        console.log(`Server is running on port ${config.get('port')}`);
      },
      stop: () => service.close()
  });
})();
