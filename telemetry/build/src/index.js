"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var f1_telemetry_client_1 = require("f1-telemetry-client");
var fs_1 = require("fs");
// or: const { F1TelemetryClient, constants } = require('f1-telemetry-client');
var socket_io_1 = require("socket.io");
var server = require('http').createServer();
var io = new socket_io_1.Server(server, {
    cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] }
});
io.listen(3001);
var sockets = [];
io.on('connection', function (socket) {
    socket.on("getLapData", function () {
        console.log("getlapData");
        socket.emit("lapData", laps.filter(function (l) { return l.finished && l.valid; }));
    });
    // socket.emit("lapData", laps)
    // new Connection(io, socket);   
    sockets.push(socket);
});
var laps = loadLaps();
// io.emit("lapData", laps)
function exitHandler(options, exitCode) {
    saveLaps();
    if (options.cleanup)
        console.log('clean');
    if (exitCode || exitCode === 0)
        console.log(exitCode);
    if (options.exit)
        process.exit();
}
//do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));
//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));
// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));
var PACKETS = f1_telemetry_client_1.constants.PACKETS;
/*
*   'port' is optional, defaults to 20777
*   'bigintEnabled' is optional, setting it to false makes the parser skip bigint values,
*                   defaults to true
*   'forwardAddresses' is optional, it's an array of Address objects to forward unparsed telemetry to. each address object is comprised of a port and an optional ip address
*                   defaults to undefined
*   'skipParsing' is optional, setting it to true will make the client not parse and emit content. You can consume telemetry data using forwardAddresses instead.
*                   defaults to false
*/
var client = new f1_telemetry_client_1.F1TelemetryClient({ port: 20777, bigintEnabled: false });
var stream = (0, fs_1.createWriteStream)("append.txt", { flags: 'a' });
// client.on(PACKETS.event, console.log);
// client.on(PACKETS.motion, function(...args) {
//   console.log("MOTION", ...args);
// });
// client.on(PACKETS.carSetups, console.log);
// client.on(PACKETS.lapData, console.log);
// client.on(PACKETS.session, console.log);
// client.on(PACKETS.participants, console.log);
// client.on(PACKETS.carTelemetry, console.log);
// client.on(PACKETS.carStatus, console.log);
// client.on(PACKETS.finalClassification, console.log);
// client.on(PACKETS.lobbyInfo, console.log);
// client.on(PACKETS.carDamage, console.log);
// client.on(PACKETS.sessionHistory, console.log);
var lastFrameIdentifier = laps[laps.length - 1].lastFrameIdentifier;
function log(what, name) {
    client.on(what, function (event) {
        var _a, _b;
        var data = (_a = event === null || event === void 0 ? void 0 : event.m_lapData) === null || _a === void 0 ? void 0 : _a[0];
        var lapNumber = data === null || data === void 0 ? void 0 : data.m_currentLapNum;
        var lapValid = (data === null || data === void 0 ? void 0 : data.m_currentLapInvalid) === 0;
        var time = data === null || data === void 0 ? void 0 : data.m_currentLapTimeInMS;
        var previousLapTime = data === null || data === void 0 ? void 0 : data.m_lastLapTimeInMS;
        var currentFrameIdentifier = (_b = event === null || event === void 0 ? void 0 : event.m_header) === null || _b === void 0 ? void 0 : _b.m_frameIdentifier;
        // console.log(currentFrameIdentifier)
        // let currentLap: Lap = null;
        var previousLap = laps[laps.length - 2];
        if (previousLap && previousLapTime > previousLap.time && previousLap.valid) {
            previousLap.time = previousLapTime;
            previousLap.finished = true;
            console.log({ previousLap: previousLap });
            io.sockets.emit("lapFinished", previousLap);
            saveLaps();
        }
        if (currentFrameIdentifier < lastFrameIdentifier) {
            // new session, add new lap
            var currentLap = {
                id: laps.length,
                lapId: lapNumber,
                time: time,
                valid: lapValid,
                finished: false,
                lastFrameIdentifier: currentFrameIdentifier,
            };
            laps.push(currentLap);
        }
        else {
            var lastLap = laps[laps.length - 1];
            if (lastLap.lapId === lapNumber) {
                lastLap.time = time;
                lastLap.valid = lapValid;
                lastLap.lastFrameIdentifier = currentFrameIdentifier;
            }
            else {
                var currentLap = {
                    id: laps.length,
                    lapId: lapNumber,
                    time: time,
                    valid: lapValid,
                    finished: false,
                    lastFrameIdentifier: currentFrameIdentifier,
                };
                laps.push(currentLap);
            }
        }
        lastFrameIdentifier = currentFrameIdentifier;
        console.log(laps);
        stream.write(JSON.stringify({ m_header: event.m_header, m_lapData: data }, null, 2) + "\n");
    });
}
// log(PACKETS.carTelemetry, "CAR_TELEMATRY");
// log(PACKETS.session, "SESSION");
log(PACKETS.lapData, "LAP_DATA");
setInterval(function () {
    saveLaps();
}, 5 * 1000);
// to start listening:
client.start();
function saveLaps() {
    (0, fs_1.writeFileSync)("laps.json", JSON.stringify(laps), { encoding: "utf-8" });
}
function loadLaps() {
    try {
        return JSON.parse((0, fs_1.readFileSync)("laps.json", { encoding: "utf-8" }).toString());
    }
    catch (error) {
        return [];
    }
}
// and when you want to stop:
// client.stop();
