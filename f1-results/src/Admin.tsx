import React, { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
// import Table from './table';

// import './App.css';

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
}

function Admin() {
  const [socket, setSocket] = useState<Socket>();
  const [userIdUnderEdit, setUserIdUnderEdit] = useState<number>(0);
  const [users, setUsers] = useState<User[]>([]);
  // const [lapData, setLapData] = useState<Lap[]>([]);

  useEffect(() => {
    const newSocket = io(`http://${window.location.hostname}:3001`, {});
    // newSocket.on()
    setSocket(newSocket as unknown as any);
    // return () => newSocket.close();
  }, [setSocket]);

  useEffect(() => {
    const listOfUsersListener = (users: User[]) => {
      setUsers(() => {
        // const newMessages = {...prevMessages};
        // delete newMessages[messageID];
        // console.log(users)
        return users;
      });
    };

    // socket?.on('lapFinished', lapFinishedListener);
    socket?.on('listOfUsers', listOfUsersListener);
    socket?.on('connect', () => {
      // console.log("connect")
      socket.emit("getListOfUsers")
    });

    return () => {
      socket?.off('listOfUsers', listOfUsersListener);
      socket?.off('connect');
    };
  }, [socket]); 

  const deleteUser = (id: number) => {
    const user = users.find(u=> u.id === id);
    if(!user?.hasRecord) {
      socket?.emit("deleteUser", id)
    }
  }

  const editName = (id: number) => {
    if(userIdUnderEdit) {
      return;
    }
    const user = users.find(u=> u.id === id) as User;

    setUserIdUnderEdit(id);
    setInput(user.name)
  }

  const updateName = (id: number) => {
    if(!userIdUnderEdit) {
      return;
    }
    socket?.emit("updateName", {id: userIdUnderEdit, name: input })
    setUserIdUnderEdit(0)
  }

  const setAsDriver = (id: number) => {
    // const user = users.find(u=> u.id === id);
      socket?.emit("setAsDriver", id)
  }

  const addUser = () => {
    // const user = users.find(u=> u.id === id);
      socket?.emit("addUser", {name: newUserName})
      setNewUserName("")
  }

  const [input, setInput] = useState(''); // '' is the initial state value
  const [newUserName, setNewUserName] = useState(''); // '' is the initial state value
  
  return (
    <div className="resultsarchive-wrapper adminfix">
      <div className="resultsarchive-content-header">
        <h1 className="ResultsArchiveTitle">    2021 Driver Standings        </h1>
      </div>
      <div className="resultsarchive-content">
        <div className="table-wrap"><table className="resultsarchive-table">
          <thead>
            <tr>
              <th className="limiter"></th>
              <th>Driver</th>
              <th>Edit Name</th>
              <th>Delete</th>
              <th>Set as Driver</th>
              <th className="limiter"></th>
            </tr>
          </thead>
          
          <tbody>
            {users
              .sort((a, b) => a.id - b.id)
              .map((message) => (
                <tr key={message.id}>
                  <td className="limiter"></td>
                  <td>
                  {userIdUnderEdit === message.id ? 
                    <input value={input} onInput={e => setInput((e.target as HTMLInputElement).value)}/>
                    : 
                    message.name
                    }
                    
                    </td>
                  <td>
                    {userIdUnderEdit === message.id ? 
                    <button className="blue" onClick={() => updateName(message.id)}>Save</button>
                    : 
                    <button className="blue" onClick={() => editName(message.id)}>Edit</button>
                    }
                    </td>
                  <td><button disabled={message.hasRecord} className="red" onClick={() => deleteUser(message.id)}>Delete</button></td>
                  <td><button className={`setdriver ${message.selected && "selected"}`} onClick={() => !message.selected && setAsDriver(message.id)}>{message.selected ? "Driver" : "Set As Driver"}</button></td>
                  <td className="limiter"></td>
                </tr>
              ))
            }
            <tr>
                  <td className="limiter"></td>
                  <td>
                  <input value={newUserName} onInput={e => setNewUserName((e.target as HTMLInputElement).value)}/>
                    </td>
                  <td>
                  <button className="blue" onClick={() => addUser()}>Add</button>
                    
                    </td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td className="limiter"></td>
                </tr>
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

export default Admin;
