'use client'
import {Box, Button, CssBaseline, Stack, Switch, 
  TextField, createTheme, ThemeProvider, Typography} from "@mui/material"
//import { Content } from "next/font/google";
//import Image from "next/image";
//{ Messages } from "openai/resources/beta/threads/messages";
import {useState, useEffect, useRef} from "react";
import {PersonRounded, AssistantRounded} from '@mui/icons-material'

export default function Home() {

  const [darkMode, setDarkMode] = useState(false);
  const [messages, setMessages] = useState([
    {
    role: 'assistant',
    content: `Hi I'm the Rate My Professor AI assistant. How can I assist you today?` 
    },
  ])

  const [message, setMessage] = useState('')
  const messagesEndRef = useRef(null)
  // button color change when press 'enter'
  const [buttonColor, setButtonColor] = useState('primary');

  const sendMessage = async()=>{

    // Change button color to indicate message was sent
    setButtonColor('secondary');

    // Resent button color after 100ms
    setTimeout(() => {
      setButtonColor('primary');
    }, 200);
    
    // message handling logic
    setMessage('')
    setMessages((messages)=>[
      ...messages,
      {role: 'user', content: message},
      {role: 'assistant', content:""}
    ])

    const response = fetch('/api/chat', {
      method: "POST",
      headers:{
        'Content-Type':'application/json'
      },
      body: JSON.stringify([...messages,{role: 'user', content: message}])
    }).then(async(response)=>{
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      let result = ''
      return reader.read().then(function ProcessText({done, value}){
        if (done){
          return result

        }
        const text = decoder.decode(value || new Uint8Array(), {stream: true})
        setMessages((messages)=>{
          let lastMessage = messages[messages.length-1]
          let otherMessages = messages.slice(0, messages.length-1)
          return[
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text
            }
          ]
        })
        return reader.read().then(ProcessText)
      })

    })
  }

  // Function to scroll to the bottom of the messages container
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"})
  }

  useEffect (() => {
    scrollToBottom();
  }, [messages])

  const handleToggle = () => {
    setDarkMode(!darkMode);
  };

  const lightTheme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#1E88E5',
      },
      secondary: {
        main: '#FB8C00',
      },
      background: {
        default: '#C7EBDF'
      },
    },
    
  });

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#CE93D8',
      },
      secondary: {
        main: '#80CBC4',
      },
      background: {
        default: '#121212'
      },
    },
    
  });
  

  return (
    <ThemeProvider theme={darkMode? darkTheme: lightTheme}>
    <CssBaseline />
    <Box
      width={"100vw"}
      height={"100vh"}
      display={"flex"}
      flexDirection={"column"}
      justifyContent={"center"}
      alignItems={"center"}
      bgcolor={darkMode ? '#121212' : '#C7EBDF'}
    >
      <Typography variant="h2" marginTop={3}>RMP Chatbot</Typography>
      <Stack
       marginTop={2}
       marginBottom={6}
       direction={"column"}
       width={'600px'}
       height={'700px'}
       border={'5px solid'}
       borderColor={darkMode? 'white': 'black'}
       borderRadius={"25px"}
       p={2}
       spacing={2}
       bgcolor={darkMode ? 'black' : 'white'}
       sx={{boxShadow: 4}}
      >
        <Box>
          <Switch checked={darkMode} onChange={handleToggle}></Switch> 
          {darkMode ? "Dark Mode": "Light Mode"}
        </Box>
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow={'auto'}
          maxHeight={'100vw'}
        >
          {
            messages.map((message, index)=> (
              <Box key={index}
                display={'flex'}
                justifyContent={
                  message.role=== 'assistant' ? 'flex-start' : 'flex-end'
                }
              >
                <Box 
                  display={'flex'} 
                  flexDirection={message.role === 'assistant' ? 'row' : 'row-reverse'} 
                  alignItems={'center'}
                >
                {message.role=== 'assistant' ? (
                  <AssistantRounded /> ) : ( 
                  <PersonRounded />)}
                <Box
                  bgcolor={
                    message.role === 'assistant' 
                      ? 'primary.main'
                      : 'secondary.main'
                  }
                  color={'white'}
                  borderRadius={16}
                  p={3}
                  marginLeft={message.role === 'assistant'? 1:0}
                  marginRight={message.role === 'assistant'? 0: 1}
                >
                  {message.content}
                </Box>
              </Box>
              </Box>
            ))
          }
          <div ref={messagesEndRef}/>
        </Stack>
        <Stack 
          direction={'row'}
          spacing={2}>
          
          <TextField
            label="message"
            fullWidth
            value={message}
            onChange={(e)=>setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key==='Enter'){
                e.preventDefault()
                sendMessage()
              }
            }}
            multiline
            maxRows={4}
            variant="outlined"
            sx={{resize: 'none', boxShadow: 2, bgcolor: darkMode ? '#121212' : '#E0FFFF'}}
            />
            <Button
              variant="contained"
              color={buttonColor}
              onClick={sendMessage}
            >Send</Button>
        </Stack>
      </Stack>
    </Box>
    </ThemeProvider>
  )
}






// 'use client'
// import Image from "next/image";
// import { useState } from "react";
// import { Box, Stack, Button, TextField } from "@mui/material";

// export default function Home() {
//   const [messages, setMessages] = useState([
//     {
//       role: "assistant",
//       content: "Hi I am the Rate My Professor Support System, How can I help oyou today?",

//     }
//   ])
//   const [message, setMessage] = useState('')
//   const sendMessage = async () => {
//     setMessages((messages)=>[
//       ...messages,
//       {role: 'user', content: message},
//       {role: 'assistant', content:''},
//     ])

//     setMessage('')
//     const response = fetch('/api/chat', {
//       method: "POST",
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify([...messages, {role: 'user', content: message}])
//     }).then(async(res)=>{
//       const reader = res.body.getReader()
//       const decoder = new TextDecoder()

//       let result = ''
//       return reader.read().then(function ProcessText({done, value}){
//         if (done){
//           return result
//         }
//         const text = decoder.decode(value || new Uint8Array(), {stream: true})
//         setMessages((messages)=>{
//           let lastMessage = messages[messages.length-1]
//           let otherMessages = messages.slice(0, messages.length-1)
//           return[
//             ...otherMessages,
//             {
//               ...lastMessage,
//               content: lastMessage.content + text
//             }
//           ]
//         })
//         return reader.read().then(ProcessText)
//       })
//     })
//   }

//   return (
//     <Box
//       width={"100vw"}
//       height={"100vh"}
//       display={"flex"}
//       flexDirection={"column"}
//       justifyContent={"center"}
//       alignItems={"center"}
//     >
//       <Stack
//         direction={"column"}
//         width={'600px'}
//         height={'700px'}
//         border={'5px solid'}
//         p={2}
//         spacing={3}
//       >
//         <Stack
//           direction={'column'}
//           spacing={2}
//           flexGrow={1}
//           overflow={'auto'}
//           maxHeight={'100vw'}
//         >
//         {
//           messages.map((message, index)=> (
//             <Box key={index}
//               display={'flex'}
//               justifyContent={
//                 message.role=== 'assistant' ? 'flex-start' : 'flex-end'
//               }>
//                 <Box
//                   bgcolor={
//                     message.role === 'assistant' 
//                       ? 'primary.main'
//                       : 'secondary.main'
//                   }
//                   color={'white'}
//                   borderRadius={16}
//                   p={3}
//                   marginLeft={message.role === 'assistant'? 1:0}
//                   marginRight={message.role === 'assistant'? 0: 1}
//                 >
//                   {message.content}
//                 </Box>
//               </Box>
//           ))
//         }
//         </Stack>
//         <Stack 
//           direction={'row'}
//           spacing={2}>
          
//           <TextField
//             label="message"
//             fullWidth
//             value={message}
//             onChange={(e)=>setMessage(e.target.value)}
//             onKeyDown={(e) => {
//               if (e.key==='Enter'){
//                 e.preventDefault()
//                 sendMessage()
//               }
//             }}
//             multiline
//             maxRows={4}
//             variant="outlined"
//             sx={{resize: 'none', boxShadow: 2,}}
//             />
//             <Button
//               variant="contained"
//               onClick={sendMessage}
//             >Send</Button>
//         </Stack>
//       </Stack>

//     </Box>
//   )

// }