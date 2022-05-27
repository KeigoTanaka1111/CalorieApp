import React from 'react'
import Button from '@mui/material/Button';

const Login = (props) => {
  return (
    <Button href="/auth/google" color={props.color}>Google Login</Button>
  )
}

export default Login