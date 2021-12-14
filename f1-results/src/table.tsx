import React, { useEffect, useState } from 'react';
import './table.css';
// import { Socket } from 'socket.io-client';


interface Lap {
  id: number;
  // lapId: number;
  time: number;
  // valid: boolean;
  // finished: boolean;
  // lastFrameIdentifier: number;
  name: string;
  team: string;
  diff: string;
}

function Table(params: {lapData: Lap[]}) {
  const { lapData } = params;
  // const [lapData, setLapData] = useState<Lap[]>([]);
  // console.log({ socket })
  // useEffect(() => {
  //   const lapFinishedListener = (lap: Lap) => {
  //     // setLapData([...lapData, lap])
  //     setLapData((laps: Lap[]) => {

  //       // console.log({prevMessages, lapData})
  //       const newMessages = [...laps, lap];
  //       // newMessages[message.id] = message;
  //       return newMessages;
  //     });
  //   };

  //   const lapDataListener = (lapData: Lap[]) => {
  //     setLapData((prevMessages: Lap[]) => {
  //       // const newMessages = {...prevMessages};
  //       // delete newMessages[messageID];
  //       return lapData;
  //     });
  //   };

  //   socket.on('lapFinished', lapFinishedListener);
  //   socket.on('lapData', lapDataListener);

  //   socket.emit('getLapData');

  //   return () => {
  //     socket.off('lapFinished', lapFinishedListener);
  //     socket.off('deleteMessage', lapDataListener);
  //   };
  // }, [socket]); 
  return (
    <div className="resultsarchive-wrapper">
      <div className="resultsarchive-content-header">
        <h1 className="ResultsArchiveTitle">    2021 Driver Standings        </h1>
      </div>
      <div className="resultsarchive-content">

        <div className="table-wrap"><table className="resultsarchive-table">
          <thead>
            <tr>
              <th className="limiter"></th>
              <th><abbr title="Position">Pos</abbr></th>
              <th>Driver</th>
              <th>Car</th>
              <th><abbr title="Points">Time</abbr></th>
              <th>Diff</th>
              <th className="limiter"></th>
            </tr>
          </thead>

          <tbody>
            {lapData
              .sort((a, b) => a.id - b.id)
              .map((message) => (

                <tr key={message.id}>
                  <td className="limiter"></td>
                  <td className="dark">1</td>
                  <td>
                  <span>{message.name}</span>
                  </td>
                  <td>
                    <span>{message.team}</span>
                  </td>
                  <td className="dark bold">{message.time}</td>
                  <td className="dark bold">{message.diff}</td>
                  <td className="limiter"></td>
                </tr>
              ))
            }
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

export default Table;
