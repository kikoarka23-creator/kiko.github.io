let client;
let clientID = "clientID-" + Math.floor(Math.random() * 1000);
const broker = "broker.hivemq.com"; // broker publik WSS
const port = 443;                    // port standar HTTPS/WSS

// Start MQTT connection
function startConnect() {
    if (client && client.isConnected()) {
        console.log("Already connected");
        return;
    }

    client = new Paho.MQTT.Client(broker, Number(port), clientID);
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    const options = {
        useSSL: true,
        timeout: 5,
        onSuccess: onConnect,
        onFailure: function(e) {
            console.log("Connect failed:", e);
            setTimeout(startConnect, 3000); // coba reconnect jika gagal
        }
    };

    client.connect(options);
}

// Called when connected
function onConnect() {
    console.log("WSS connected!");
    const topics = ["sensor/temperature", "sensor/humidity", "sensor/infrared", "sensor/current_voltage"];
    topics.forEach(t => client.subscribe(t));
}

// Called when a message arrives
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

// Called when connection is lost
function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("Connection lost:", responseObject.errorMessage);
        setTimeout(startConnect, 3000); // reconnect after 3 seconds
    }
}

// Send relay command safely
function switchRelay(relayNumber, state) {
    if (!client || !client.isConnected()) {
        console.log("Client not connected yet! Cannot send command.");
        return;
    }

    const topic = "relay/" + relayNumber;
    const message = new Paho.MQTT.Message(state);
    message.destinationName = topic;
    client.send(message);
    console.log("Sent", topic, state);
}

// Start connection when page loads
window.addEventListener('load', startConnect);
