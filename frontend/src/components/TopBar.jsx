// src/components/TopBar.jsx

import { AppBar, Toolbar, Typography, Select, MenuItem } from "@mui/material";

function TopBar({ currentUser, setCurrentUser, users }) {
  return (
    <AppBar position="static" style={{ backgroundColor: "#075E54" }}>
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          {currentUser}
        </Typography>
        <Select
          value={currentUser}
          onChange={(e) => setCurrentUser(e.target.value)}
          style={{ color: "white", borderBottom: "1px solid white" }}
        >
          {users.map((user) => (
            <MenuItem key={user} value={user}>
              {user}
            </MenuItem>
          ))}
        </Select>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
