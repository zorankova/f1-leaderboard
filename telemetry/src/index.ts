import { F1TelemetryClient, constants } from "f1-telemetry-client";
import { access, createWriteStream, readFileSync, writeFileSync } from "fs";
import moment from "moment";
// or: const { F1TelemetryClient, constants } = require('f1-telemetry-client');


// const TEAMS = {
//   0: "Mercedes",
//   1: "Ferrari",
//   2: "Red Bull Racing",
//   3: "Wiliams",
//   4: "Aston Martin",
//   5: "Alpine",
//   6: "Alpha Tauri",
//   7: "Haas",
//   8: "McLaren",
//   9: "Alfa Romeo"
// }

// const TRACKS = {
//   0: "Melbourne",
//   1: "Paul Ricard",
//   2: "Shanghai",
//   3: "Sakhir (Bahrain)",
//   4: "Catalunya",
//   5: "Monaco",
//   6: "Montreal",
//   7: "Silverstone",
//   8: "Hockenheim",
//   9: "Hungaroring",
//   10: "Spa",
//   11: "Monza",
//   12: "Singapore",
//   13: "Suzuka",
//   14: "Abu Dhabi",
//   15: "Texas",
//   16: "Brazil",
//   17: "Austria",
//   18: "Sochi",
//   19: "Mexico",
//   20: "Baku (Azerbaijan)",
//   21: "Sakhir Short",
//   22: "Silverstone Short",
//   23: "Texas Short",
//   24: "Suzuka Short",
//   25: "Hanoi",
//   26: "Zandvoort",
//   27: "Imola",
//   28: "Portimão",
//   29: "Jeddah",
// }

import { Server } from "socket.io";
const server = require('http').createServer();

const io = new Server(server, {
  cors: {    origin: "http://localhost:3000",    methods: ["GET", "POST"]  }
});
io.listen(3001);
// let currentTeam = "";
// let currentTrack = "";
function generateStandings() {
  const results = users.reduce((acc, user) => ({
    ...acc, 
    [user.id]: {
      name: user.name, 
      time: null, 
      timeMs: null,
      team: "-", 
      diff: null,
    
    }}), {} as {[K: string]: {name: string; time: string; timeMs:number; team: string; diff: string}})
  
  let fastestTime = 100000000;

  for (const lap of laps) {
    if(!lap.finished) {
      continue;
    }
    if(!lap.valid) {
      continue;
    }

    if(!lap.driverId) {
      continue;
    }
    console.log({users, lap})
    const user = users.find(u => u.id === lap.driverId)
    if(user?.softDeleted) {
      continue;
    }

    if(lap.time < (results[lap.driverId].timeMs ?? 100000000)) {
      results[lap.driverId].timeMs = lap.time
      // results[lap.driverId].team = lap.team
      if(lap.time < fastestTime) {
        fastestTime = lap.time;
      }
    }
  }


  for (const driverId of Object.keys(results)) {
    if(results[driverId].timeMs) {
      results[driverId].time = moment(results[driverId].timeMs).format("m:ss.SSS")
    }
    
    if(results[driverId].timeMs > fastestTime) {
      const diff = results[driverId].timeMs - fastestTime;
      results[driverId].diff = diff < 60 * 1000 ?
        `+${moment(diff).format("s.SSS")}` :
        `+${moment(diff).format("m:ss.SSS")}`
      
    }
  }
  // console.log("generateStandings", Object.values(results).sort((a, b) => (a.timeMs || 100000000) - (b.timeMs || 100000000)))
  return Object.values(results).sort((a, b) => (a.timeMs || 100000000) - (b.timeMs || 100000000))
}

const sockets = [];
io.on('connection', (socket) => {
  socket.on("getLapData", () => {
    console.log("getlapData")
    socket.emit("lapData", generateStandings())
  });

  socket.on("getListOfUsers", () => {
    console.log("getListOfUsers")
    socket.emit("listOfUsers", users)
  });

  socket.on("setAsDriver", (driverId: number) => {
    console.log("setAsDriver")
    users.forEach((user) => {
      user.selected = user.id === driverId;
    });

    io.sockets.emit("listOfUsers", users)
    
  });

  socket.on("updateName", ({id, name}) => {
    console.log("updateName")

    users.forEach((user) => {
      if(user.id === id) {
        user.name = name;
      }
    });

    const standings = generateStandings();
    io.sockets.emit("listOfUsers", users)
      io.sockets.emit("lapData", standings)
    
  });

  socket.on("addUser", ({name}) => {
    console.log("addUser")
    users.push({
      id: Date.now(), 
      name,
      hasRecord: false, 
      selected: false,
      softDeleted: false,
      })
  
    const standings = generateStandings();
    io.sockets.emit("listOfUsers", users)
      io.sockets.emit("lapData", standings)
    
  });

  socket.on("deleteUser", (id) => {
    console.log("deleteUser")
    const index = users.findIndex(u => u.id === id);
    if(users[index].hasRecord) {
      return;
    }
    users[index].softDeleted = true;
    // users.splice(index, 1);
    const standings = generateStandings();
    // sockets.forEach(s => {
      io.sockets.emit("listOfUsers", users)
      io.sockets.emit("lapData", standings)
    // })
    
  });

  // socket.emit("lapData", laps)
  // new Connection(io, socket);   
  sockets.push(socket)
});
// sockets.forEach(socket =>     socket.emit("lapData", [])
// )
// const resultsNamespace = io.of("/results");

interface Lap {
  id: number;
  time: number;
  name: string;
  team: string;
  diff: string;
}

interface LapResult {
  id: number;
  lapId: number;
  time: number;
  // team?: string;
  valid: boolean;
  finished: boolean;
  lastFrameIdentifier: number;
  driverId?: number;
}

export interface User {
  id: number;
  // lapId: number;
  // time: number;
  // valid: boolean;
  // finished: boolean;
  // lastFrameIdentifier: number;
  name: string;
  hasRecord: boolean;
  selected: boolean;
  softDeleted: boolean;
}

const laps: LapResult[] = loadLaps();
const users: User[] = loadUsers();

// io.emit("lapData", laps)
function exitHandler(options: any, exitCode: any) {
  saveLaps();
  saveUsers()
  if (options.cleanup) console.log('clean');
  if (exitCode || exitCode === 0) console.log(exitCode);
  if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

const { PACKETS } = constants;

const client = new F1TelemetryClient({ port: 20777, bigintEnabled: false });
// var stream = createWriteStream("append.txt", {flags:'a'});
// client.on(PACKETS.event, console.log);
// client.on(PACKETS.motion, function(...args) {
//   console.log("MOTION", ...args);
// });
// client.on(PACKETS.carSetups, console.log);
// client.on(PACKETS.lapData, console.log);


// client.on(PACKETS.participants, function(event) {
//   currentTeam = TEAMS[event?.m_participants?.find(p => p.m_networkId === 0)?.m_teamId]
// });
// client.on(PACKETS.session, function(event) {
//   currentTrack = TRACKS[event?.m_trackId];
// });


// client.on(PACKETS.carTelemetry, console.log);
// client.on(PACKETS.carStatus, console.log);
// client.on(PACKETS.finalClassification, console.log);
// client.on(PACKETS.lobbyInfo, console.log);
// client.on(PACKETS.carDamage, console.log);
// client.on(PACKETS.sessionHistory, console.log);


let lastFrameIdentifier = laps[laps.length -1]?.lastFrameIdentifier || 1000000000000;

function log(what: string,name: string) {
  client.on(what, function(event) {
    
    const data = event?.m_lapData?.[0];

    const lapNumber = data?.m_currentLapNum
    const lapValid = data?.m_currentLapInvalid === 0
    const time = data?.m_currentLapTimeInMS
    const previousLapTime = data?.m_lastLapTimeInMS
    const currentFrameIdentifier = event?.m_header?.m_frameIdentifier;

    // console.log(currentFrameIdentifier)

    // let currentLap: Lap = null;


    if(currentFrameIdentifier < lastFrameIdentifier) {
      // new session, add new lap

      const currentLap: LapResult = {
        id: laps.length,
        lapId: lapNumber,
        time: time,
        valid: lapValid,
        finished: false,
        lastFrameIdentifier: currentFrameIdentifier,
      }
      laps.push(currentLap)
      const previousLap = laps[laps.length  - 2];
      if(previousLap) {
        previousLap.finished = true;
        previousLap.valid = false;  
      }
    } else {
      const lastLap: LapResult = laps[laps.length - 1];

      if(lastLap.lapId === lapNumber) {
        lastLap.time = time;
        lastLap.valid = lapValid;
        lastLap.lastFrameIdentifier = currentFrameIdentifier;
      } else {
        const currentLap: LapResult = {
          id: laps.length,
          lapId: lapNumber,
          time: time,
          valid: lapValid,
          finished: false,
          lastFrameIdentifier: currentFrameIdentifier,
        }
        laps.push(currentLap)
      }

      const previousLap = laps[laps.length  - 2];


      if(previousLap && !previousLap.finished) {
        previousLap.finished = true;

        if(previousLap.valid) {
          previousLap.time = previousLapTime;
          const user = users.find(u => u.selected);
          previousLap.driverId = user.id
          user.hasRecord = true;
    
          // previousLap.team = currentTeam;
          // console.log({previousLap})
          io.sockets.emit("lapFinished", previousLap)
          io.sockets.emit("listOfUsers", users)
          saveLaps()
        }
      }
    }




    lastFrameIdentifier = currentFrameIdentifier

    
    
    // console.log(laps);
    // stream.write(JSON.stringify({m_header: event.m_header, m_lapData: data}, null, 2) + "\n")
  });
}



// log(PACKETS.carTelemetry, "CAR_TELEMATRY");
// log(PACKETS.session, "SESSION");
log(PACKETS.lapData, "LAP_DATA");
setInterval(() => {
  saveLaps()
  saveUsers();
}, 5 * 1000)
// to start listening:
client.start();

function saveLaps() {
  writeFileSync("laps.json", JSON.stringify(laps), {encoding: "utf-8"});
}

function loadLaps() {
  try {
  return JSON.parse(readFileSync("laps.json", {encoding: "utf-8"}).toString()) 
  } catch (error) {
    return []
  }
}

function saveUsers() {
  writeFileSync("users.json", JSON.stringify(users), {encoding: "utf-8"});
}

function loadUsers() {
  try {
  return JSON.parse(readFileSync("users.json", {encoding: "utf-8"}).toString()) 
  } catch (error) {
    return []
  }
}

// and when you want to stop:
// client.stop();
