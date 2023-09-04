import smacker from  "smacker";
import app from "./app";

(async function() {
    const server = await app();
    let service;
    smacker.start({
        start: () => {
          service = server.listen(5000, '0.0.0.0')
        },
        stop: () => service.close()
    });
})();
