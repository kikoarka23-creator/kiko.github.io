let client;
let clientID = "clientID-" + Math.floor(Math.random() * 1000);
const broker = "broker.emqx.io";
const port = 8083; // WebSocket port

// Start MQTT connection
function startConnect() {
    client = new Paho.MQTT.Client(broker, Number(port), clientID);
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    const options = {
        useSSL: false,
        timeout: 3,
        onSuccess: onConnect,
        onFailure: function(e){ console.log("Connect failed: ", e); }
    };
    client.connect(options);
}

// When connected
function onConnect() {
    console.log("Connected to MQTT broker!");
    // Subscribe all sensor topics
    client.subscribe("sensor/temperature");
    client.subscribe("sensor/humidity");
    client.subscribe("sensor/infrared");
    client.subscribe("sensor/current_voltage");
}

// Message received
function onMessageArrived(message) {
    const topic = message.destinationName;
    const payload = message.payloadString;

    switch(topic) {
        case "sensor/temperature":
            document.getElementById("temperature").innerText = payload;
            break;
        case "sensor/humidity":
            document.getElementById("humidity").innerText = payload;
            break;
        case "sensor/infrared":
            document.getElementById("infrared").innerText = payload;
            break;
        case "sensor/current_voltage":
            document.getElementById("current").innerText = payload;
            break;
    }
    console.log("Received", topic, payload);
}

// Connection lost
function onConnectionLost(responseObject) {
    console.log("Connection lost: " + responseObject.errorMessage);
    startConnect(); // reconnect
}

// Send relay command
function switchRelay(relayNumber, state) {
    const topic = "relay/" + relayNumber;
    const message = new Paho.MQTT.Message(state);
    message.destinationName = topic;
    client.send(message);
    console.log("Sent", topic, state);
}

// Start connection when page loads
window.onload = startConnect;
