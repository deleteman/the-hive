import React from "react";

import {
  Card,
  CardContent,
  Avatar,
  Image,
  Divider,
  Box,
  Typography,
  Chip,
} from "@mui/material";

const ProfileCard = (props) => {
  return (
    <Card>
      <Box p={2} display="flex" alignItems="center">
        <Box display="flex" alignItems="center">
          <Avatar
            src={props.avatar_url}
            alt={props.avatar_url}
            width="30"
            height="30"
            className="roundedCircle"
          />
        </Box>
        <Box
            sx={{
              display: {
                xs: "none",
                sm: "flex",
              },
              alignItems: "center",
            }}
          >
          <Typography variant="h5"   
              fontWeight="400"
              sx={{ ml: 1 }}>{props.title}</Typography>
        </Box>
      </Box>
      <CardContent>{props.children}</CardContent>
    </Card>
  );
};

export default ProfileCard;
