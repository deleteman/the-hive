import React from "react";
import * as timeago from 'timeago.js';

import {
  Card,
  CardContent,
  Divider,
  Box,
  Typography,
  Chip,
Stack,
} from "@mui/material";

const RepoCard = (props) => {
  return (
    <Card>
      <Box p={2} display="flex" alignItems="center">
        <Stack direction="row" spacing={2} >
          <Typography variant="h4">{props.title}</Typography>
          <Typography variant="h6">Last commit {timeago.format(props.last_commit)}</Typography>
        </Stack>
      </Box>
      <CardContent>{props.children}</CardContent>
    </Card>
  );
};

export default RepoCard;
