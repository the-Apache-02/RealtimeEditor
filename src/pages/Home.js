import React, { useState } from 'react'
import logo from '../logo.png';
import { Link } from 'react-router-dom';
import { v4 as uuV4 } from "uuid";
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
export const Home = () => {

    //create stte for room id
    const [roomId, setroomId] = useState('');
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    const createNewRoom = (e) => {
        e.preventDefault();
        const uId = uuV4();
        setroomId(uId);
        toast.success("Created new Room")
    };

    const join = (e) => {
        if (!roomId || !username) {
            toast.error("Room id and Username is required");
            return;
        }

        navigate(`/editor/${roomId}`,
            {
                state: {
                    username,
                }
            }
        );
    };

    const handleInputEnter = (e) => {
        if (e.code === 'Enter') {
            join();
        }
    }
    return (

        <div className='homePageWrapper'>
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
            <div className='formWrapper'>
                <img src={logo} alt='logo' className='logoWrapper' />
                <h4 className='mainLabel'>Paste invitation Room id</h4>

                <div className='inputGroup'>
                    <input type='text'
                        placeholder='ROOM ID'
                        className='inputBox'
                        onChange={(e) => setroomId(e.target.value)}
                        value={roomId}
                        onKeyUp={handleInputEnter}
                    />
                    <input type='text'
                        placeholder='USER NAME'
                        className='inputBox'
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        onKeyUp={handleInputEnter}
                    />

                    <button className='btn joinBtn' onClick={join}>Join</button>

                    <span className='createInfo'>
                        If you don't have invitation then create &nbsp;

                        <a onClick={createNewRoom} href='' className='createNewBtn'>New Room</a>
                    </span>
                </div>
            </div>
            <footer>
                <h4>
                    Built with 🧡 by &nbsp;
                    <a href='https'>Namo Editor</a>
                </h4>
            </footer>
        </div>
    )
}
