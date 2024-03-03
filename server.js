const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the public directory
app.use(express.static("public"));

// Socket.IO connection handling
io.on("connection", (socket) => {

  // Send previous messages to the newly connected client
  Message.find().sort('-timestamp').limit(10)
  .then(messages => {
    console.log(messages);
    socket.emit('previous messages', messages);
  })
  .catch(err => {
    console.error('Error retrieving previous messages:', err);
  });


  // Handle chat messages
  socket.on('chat message', (msg) => {
    const message = new Message({ username: msg.username, message: msg.message });
    message.save().then(() => {
      io.emit('chat message', msg);
    });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

mongoose
  .connect("mongodb://localhost/chatapp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

const messageSchema = new mongoose.Schema({
  username: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
