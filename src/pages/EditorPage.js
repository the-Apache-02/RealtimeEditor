import React, { useEffect, useRef, useState } from 'react'
import Client from '../components/Client'
import logo from '../logo.png';
import toast, { Toaster } from 'react-hot-toast';
import Realtime from '../components/Realtime';
import { initSocket } from '../socket';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import ACTIONS from '../Actions';


export const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef=useRef(null);
  const location = useLocation();
  const reactNavigator = useNavigate();
  const { roomId } = useParams();
  const [clients, setClients] = useState([])

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();

      socketRef.current.on('connect_error', (err) => handleErrors(err));
      socketRef.current.on('connect_failed', (err) => handleErrors(err));

      function handleErrors(e) {
        console.log('socket error', e);
        toast.error('socket connection failed, try again later.');
        reactNavigator('/');
      }
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username
      })

      //listen the forEach loop for the client from the call of backend showing this joined the room
      socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
        if (username !== location.state?.username) {
          toast.success(`${username} is joined`);
          console.log(`${username} is joined`)
        }
        setClients(clients);
        socketRef.current.emit(ACTIONS.SYNC_CODE,({
          socketId,
          code:codeRef.current
        }))
      })

      socketRef.current.on(ACTIONS.DISCONNECTED,({ socketId, username }) => {

        toast.success(`${username} left the room`);

        setClients((prev) => {
          return prev.filter((client) => client.socketId!==socketId);
        })
      })

    };

    init();

    //cleaning function whenever we return any function from the useEffect hook it is called as cleaning function
    //We have to disconnect all the listeners present
    return () => {
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED)
      socketRef.current.off(ACTIONS.DISCONNECTED)
    }
  }, []);




  if (!location.state) {
    return <Navigate to='/' />
  };


  async function copyRoomId(){
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room id has been copied to your clipboard")
    } catch (error) {
      toast.error("Room id has not copied");
      console.err(error);
    }
  }

  function leaveRoom(){
    reactNavigator("/");
  }
  return (<>
    <div>

      <Toaster position='top-right'
        toastOptions={{
          success: {
            theme: {
              primary: '#4aed88'
            }
          }
        }}
      >
      </Toaster>
    </div>
    <div className='mainWrapper'>
      <div className='aside'>
        <div className='asideInner'>

          <div className='logo'>
            <img className='logoImage' src={logo} alt='logo' />
          </div>

          <h3>Connected</h3>
          <div className='clientList'>
            {
              clients.map((client) => (
                <Client key={client.socketId} username={client.username} />
              ))
            }
          </div>
        </div>

        <button className='btn copybtn' onClick={copyRoomId}>Copy Room Id</button>
        <button className='btn leavebtn' onClick={leaveRoom}>Leave Room</button>
      </div>
      <div className='editorWrapper'>
        <Realtime socketRef={socketRef} roomId={roomId} onCodeChange={(code)=>{
          codeRef.current=code;
        }}/>
      </div>
    </div>
  </>
  )
}
