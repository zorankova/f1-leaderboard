"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const f1_telemetry_client_1 = require("f1-telemetry-client");
// or: const { F1TelemetryClient, constants } = require('f1-telemetry-client');
const { PACKETS } = f1_telemetry_client_1.constants;
/*
*   'port' is optional, defaults to 20777
*   'bigintEnabled' is optional, setting it to false makes the parser skip bigint values,
*                   defaults to true
*   'forwardAddresses' is optional, it's an array of Address objects to forward unparsed telemetry to. each address object is comprised of a port and an optional ip address
*                   defaults to undefined
*   'skipParsing' is optional, setting it to true will make the client not parse and emit content. You can consume telemetry data using forwardAddresses instead.
*                   defaults to false
*/
const client = new f1_telemetry_client_1.F1TelemetryClient({ port: 20777 });
// client.on(PACKETS.event, console.log);
// client.on(PACKETS.motion, console.log);
// client.on(PACKETS.carSetups, console.log);
client.on(PACKETS.lapData, console.log);
// client.on(PACKETS.session, console.log);
// client.on(PACKETS.participants, console.log);
// client.on(PACKETS.carTelemetry, console.log);
// client.on(PACKETS.carStatus, console.log);
// client.on(PACKETS.finalClassification, console.log);
// client.on(PACKETS.lobbyInfo, console.log);
// client.on(PACKETS.carDamage, console.log);
// client.on(PACKETS.sessionHistory, console.log);
// to start listening:
client.start();
// and when you want to stop:
client.stop();
//# sourceMappingURL=index.js.map