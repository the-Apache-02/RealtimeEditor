import React, { useEffect, useRef } from 'react'
import Codemirror from 'codemirror';
import 'codemirror/theme/dracula.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/mode/javascript/javascript';
import ACTIONS from '../Actions';



const Realtime = ({socketRef,roomId,onCodeChange}) => {
  const editorRef=useRef(null);
  useEffect(()=>{
        async function init(){
            editorRef.current=Codemirror.fromTextArea(document.getElementById('realtimeCodeEditor'),{
                mode:{name:'javascript',json:true},
                theme:'dracula',
                autoCloseTags:true,
                autoCloseBrackets:true,
                lineNumbers:true,
            });

            editorRef.current.on('change',(instance,changes)=>{
              console.log("Changes:",changes);
              
              const {origin}=changes;
              //console.log(`orgin: ${origin}`)
              const code=instance.getValue();
              onCodeChange(code);
              if(origin!=='setValue'){
                console.log("working")
                socketRef.current.emit(ACTIONS.CODE_CHANGE,{
                  roomId,
                  code,
                })
              }
              console.log(code)
            });
           
            //editorRef.current.setValue(`console.log("heelo")`)

        }
        init();
    },[])

    useEffect(()=>{
      if(socketRef.current){
         //now listen the event emiitted by server on evry client 
         socketRef.current.on(ACTIONS.CODE_CHANGE,({code})=>{
          if(code!==null){
            editorRef.current.setValue(code)
          }
        })
      }

      return ()=>{
        socketRef.current.off(ACTIONS.CODE_CHANGE)
      }
    },[socketRef.current])
  return (
    <textarea id='realtimeCodeEditor'></textarea>
  )
}

export default Realtime