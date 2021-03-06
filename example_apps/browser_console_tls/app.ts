import { SocketServer } from "../../mod.ts";

// Create the socket server
const socketServer = new SocketServer();
socketServer.runTLS({
  hostname: "localhost",
  port: 3000,
  certFile: "./server.crt",
  keyFile: "./server.key",
});
console.log(
  `Socket server started on wss://${socketServer.hostname}:${socketServer.port}`,
);

// Listen for connections to the socket server
socketServer.on("connection", () => {
  console.log("A user connected.");
});

// Listen for disconnections from the socket server
socketServer.on("disconnect", () => {
  console.log("A user disconnected.");
});

// Create "Channel 1" so that clients can send messages to it
socketServer
  .createChannel("Channel 1")
  .onMessage((packet: any) => {
    console.log(packet);
    console.log("Sending a message back to the client.");
    // Send messages to all clients listening to "Channel 1"
    socketServer.to(
      "Channel 1",
      `Message received! You sent "${packet.message}" as the message.`,
    );
  });
