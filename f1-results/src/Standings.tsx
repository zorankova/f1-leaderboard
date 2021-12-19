import React, { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { createAvatar } from '@dicebear/avatars';
import * as style from '@dicebear/avatars-gridy-sprites';


// import Table from './table';

// import './App.css';

export interface Standing {
  id: number;
  // lapId: number;
  time: number;
  // valid: boolean;
  // finished: boolean;
  // lastFrameIdentifier: number;
  avatarSeed: string;
  name: string;
  team: string;
  diff: string;
}

function Standings() {
  const [socket, setSocket] = useState<Socket>();
  const [lapData, setLapData] = useState<Standing[]>([]);

  useEffect(() => {
    const newSocket = io(`http://${window.location.hostname}:3001`, {});
    // newSocket.on()
    setSocket(newSocket as unknown as any);
    // return () => newSocket.close();
  }, [setSocket]);

  useEffect(() => {
    const lapFinishedListener = (lap: Standing) => {
      socket?.emit('getLapData');
      // setLapData([...lapData, lap])
      // setLapData((laps: Lap[]) => {

      //   // console.log({prevMessages, lapData})
      //   const newMessages = [...laps, lap];
      //   // newMessages[message.id] = message;
      //   return newMessages;
      // });
    };

    const lapDataListener = (lapData: Standing[]) => {
      setLapData((prevMessages: Standing[]) => {
        // const newMessages = {...prevMessages};
        // delete newMessages[messageID];
        return lapData;
      });
    };

    socket?.on('lapFinished', lapFinishedListener);
    socket?.on('lapData', lapDataListener);
    socket?.on('connect', () => {
      console.log("connect")
      socket?.emit('getLapData');
    });

    return () => {
      socket?.off('lapFinished', lapFinishedListener);
      socket?.off('lapData', lapDataListener);
      socket?.off('connect');
    };
  }, [socket]); 

  return (
    <div className="App">
      { socket ? (
        <div className="chat-container">
          <div className="resultsarchive-wrapper">
      <div className="resultsarchive-content-header">
        <h1 className="ResultsArchiveTitle">Šoferi</h1>
      </div>
      <div className="resultsarchive-content">

        <div className="table-wrap"><table className="resultsarchive-table">
          <thead>
            <tr>
              <th className="limiter"></th>
              <th><abbr title="Position">Pos</abbr></th>
              <th>Icon</th>
              <th>Driver</th>
              <th><abbr title="Points">Time</abbr></th>
              <th>Diff</th>
              <th className="limiter"></th>
            </tr>
          </thead>

          <tbody>
            {lapData
              .sort((a, b) => a.id - b.id)
              .map((message, index) => (

                <tr key={message.id}>
                  <td className="limiter"></td>
                  <td className="dark">{index + 1}</td>
                  <td>
  
<div className="logo" dangerouslySetInnerHTML={{__html: createAvatar(style, {
  seed: message.avatarSeed,
  // width: 6
  // scale: 80
  // ... and other options
})}} />
                  </td>
                  <td>
                    <span>{message.name}</span>
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
        </div>
      ) : (
        <div>Not Connected</div>
      )}
    </div>
  );
}

export default Standings;
