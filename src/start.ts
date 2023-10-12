import { Db, MongoClient } from 'mongodb';
import smacker from  "smacker";
import app from "./app";
import config from 'config';

(async function() {
  const mongoClient = new MongoClient(config.get("mongodb.url"));
  await mongoClient.connect();
  console.log("do we get this far?")
  const db:Db = mongoClient.db(config.get("mongodb.db"));

  const server = await app(db);
  let service;
  smacker.start({
      start: () => {
        service = server.listen(5000, '0.0.0.0')
      },
      stop: () => service.close()
  });
})();
