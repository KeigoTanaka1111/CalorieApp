import React from 'react'
import Button from '@mui/material/Button';
import axios from "axios";

const Login = (props) => {
  return (
    <Button href="/auth/google" color={props.color}>Login</Button>
  )
}

// const Login = (props) => {
//   const handleAuth = () => {
//     axios.get("/auth/google" ).then(
//       (res)=>{
//         if(res.data.status === 200){
//           console.log("Aaaaaaaaaaaaaaaa")
//           localStorage.setItem('auth_id', res.data.id);
//           localStorage.setItem('auth_name', res.data.displayName);
//         }
//       }
//     )
//   }
//   return (
//     <Button onClick={handleAuth} color={props.color}>Login</Button>
//   )
// }

export default Login