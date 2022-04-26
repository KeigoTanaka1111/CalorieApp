import React from 'react'
import Button from '@mui/material/Button';
// import axios from "axios";

const Login = (props) => {
  return (
    <Button href="/logout"  color={props.color}>Logout</Button>
  )
}

export default Login