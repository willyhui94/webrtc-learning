const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 9090 });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    let messageObj = null;
    try {
      messageObj = JSON.parse(message);
      console.info(messageObj);
    } catch (error) {
      console.warn(error);
    }

    switch (messageObj.type) {
      case "login": {
        const data = {
          type: messageObj.type,
          success: true
        }
        ws.send(JSON.stringify(data));
        break;
      }
      case "offer": {
        const data = {
          type: messageObj.type,
          offer: messageObj.offer,
          name: messageObj.name
        }
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
        break;
      }
      case "answer": {
        const data = {
          type: messageObj.type,
          answer: messageObj.answer,
          name: messageObj.name
        }
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
        break;
      }
      case "candidate": {
        const data = {
          type: messageObj.type,
          candidate: messageObj.candidate,
          name: messageObj.name
        }
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
        break;
      }
      default: {
        wss.clients.forEach((client) => {
          client.send(JSON.stringify({message: message}));
        })
        break;
      }
    }
  });

  console.log({ message: "WebSocket connected" });
  // ws.send("You are connected to WebSocket Server");
});