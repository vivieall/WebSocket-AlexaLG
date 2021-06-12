var port = process.env.PORT || 8080;
const WebSocket = require('ws'),
    server = new WebSocket.Server({
    port: port,
});


function broadcast (data) {
    server.clients.forEach(ws => {
        ws.send(data);
    });
}


server.on('connection', ws=>{
    console.log('client connected.')
    ws.on('message', data =>{
        console.log(data);
        broadcast(data);
    })
});


setInterval(() => {
    server.clients.forEach((client) => {
      client.send(new Date().toTimeString());
    });
  }, 1000);
