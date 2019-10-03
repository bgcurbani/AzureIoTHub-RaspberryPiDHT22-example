const Client = require('azure-iot-device').Client;
const Message = require('azure-iot-device').Message;
const Protocol = require('azure-iot-device-mqtt').Mqtt;

const sensor = require('node-dht-sensor');


var connectionString = <CONNECTIONSTRING> //


sendMessage = function(){

    sensor.read(11, 4, function(err, temperature, humidity) {
        if (!err) {
            console.log('temp: ' + temperature.toFixed(1) + '°C, ' +
                'humidity: ' + humidity.toFixed(1) + '%');
            var content = JSON.stringify({
            messageId: messageId++,
            deviceId: 'esp8266DHT22',
            temperature: temperature.toFixed(1),
            humidity: humidity.toFixed(1),
            time:new Date()
            });
    
            var message = new Message(content);
            console.log('Enviando mensagem: ' + content);
            client.sendEvent(message, (err) => {
            if (err) {
				console.error('Falha ao enviar mensagem para Azure Iot Hub');
            } else {
				console.log('Mensagem enviada para Azure IoT Hub');
            }
            setTimeout(sendMessage, 500);
            });
        }
        else{console.log('Erro ao fazer leitura do sensor');}
    });
};

receiveMessageCallback = function(msg) {
    var message = msg.getData().toString('utf-8');
    client.complete(msg, () => {
      console.log('Mensagem recebida: ' + message);
    });
  }


var client = Client.fromConnectionString(connectionString, Protocol);
messageId =0;
console.log('pre client open');
client.open((err) => {
	console.log('client opened');
    if (err) {
      console.error('[IoT hub Client] Connect error: ' + err.message);
      return;
    }
    client.on('disconnect',function(){
        client.removeAllListeners();
        console.log('client disconnected');
    });
    client.on('message', receiveMessageCallback);
    sendMessage();
});