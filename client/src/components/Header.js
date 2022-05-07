import React, { useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Login from '../components/Login';
import Logout from '../components/Logout';

const Header = () => {
  // useEffect(()=>{},[]);
  return (
    <div >
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }} >
            カロリー管理
          </Typography>
          <Login color="inherit"/>
          /
          <Logout color="inherit"/>
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default Header;