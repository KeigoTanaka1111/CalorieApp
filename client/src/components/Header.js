import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
// import IconButton from '@mui/material/IconButton';
// import MenuIcon from '@mui/icons-material/Menu';
import Login from '../components/Login';
import Logout from '../components/Logout';

const Header = () => {
  return (
    <div >
      <AppBar position="static">
        <Toolbar>
          {/* <IconButton edge="start"  color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton> */}
          <Typography variant="h6" sx={{ flexGrow: 1 }} >
            カロリー管理App
          </Typography>
          <Login color="inherit"/>
          <Logout color="inherit"/>
          {localStorage.getItem("auth_name")}
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default Header;