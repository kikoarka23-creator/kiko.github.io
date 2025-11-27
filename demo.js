let client;
let clientID = "clientID-" + Math.floor(Math.random() * 10000);

// MQTT Broker
const broker = "broker.emqx.io";
const port = 8084; // WSS (Secure WebSocket)

// Start connection
function startConnect() {
    console.log("Connecting to MQTT...");

    // Use WSS (Secure)
    client = new Paho.MQTT.Client("wss://" + broker + ":" + port + "/mqtt", clientID);

    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    const options = {
        timeout: 3,
        useSSL: true,   // 🔥 WAJIB!!! untuk GitHub Pages
        onSuccess: onConnect,
        onFailure: function (e) {
            console.log("Connect failed:", e);
            setTimeout(startConnect, 3000); // retry
        }
    };

    client.connect(options);
}

// When connected
function onConnect() {
    console.log("Connected to MQTT broker!");

    // Subscribe to all ESP topics
    client.subscribe("sensor/temperature");
    client.subscribe("sensor/humidity");
    client.subscribe("sensor/infrared");
    client.subscribe("sensor/current_voltage");
}

// Message received
function onMessageArrived(message) {
    const topic = message.destinationName;
    const payload = message.payloadString;

    if (topic === "sensor/temperature") {
        document.getElementById("temperature").innerText = payload;
    }
    if (topic === "sensor/humidity") {
        document.getElementById("humidity").innerText = payload;
    }
    if (topic === "sensor/infrared") {
        document.getElementById("infrared").innerText = payload;
    }
    if (topic === "sensor/current_voltage") {
        document.getElementById("current").innerText = payload;
    }

    console.log("Received:", topic, payload);
}

// If disconnected → reconnect
function onConnectionLost(responseObject) {
    console.log("Connection lost:", responseObject.errorMessage);
    setTimeout(startConnect, 2000);
}

// Publish relay control
function switchRelay(relayNumber, state) {
    const topic = "relay/" + relayNumber;
    const message = new Paho.MQTT.Message(state);
    message.destinationName = topic;
    client.send(message);
    console.log("Sent:", topic, state);
}

// Start when page loads
window.onload = startConnect;
