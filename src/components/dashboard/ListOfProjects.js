import React from "react";
import {
  Typography,
  Link,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import {OpenInNew, OpenWithOutlined} from "@mui/icons-material"
import BaseCard from "../baseCard/BaseCard";


const ListOfProjects = ({repos}) => {

  return (
    <BaseCard title="Your imported projects">
      <Table
        aria-label="simple table"
        sx={{
          mt: 3,
          whiteSpace: "nowrap",
        }}
      >
        <TableHead>
          <TableRow>
           <TableCell>
              <Typography color="textSecondary" variant="h6">
                Project name
              </Typography>
            </TableCell>
            <TableCell>
              <Typography color="textSecondary" variant="h6">
                View on Github
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {repos.map((proj) => (
            <TableRow key={proj.id}>
              <TableCell>
                <Typography
                  sx={{
                    fontSize: "15px",
                    fontWeight: "500",
                  }}
                >
                  {proj.full_name}
                </Typography>
              </TableCell>
              <TableCell>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography
                      variant="overline"
                      sx={{
                        fontWeight: "600",
                      }}
                      gutterBottom
                      component="div"
                    >
                      {proj.url}
                      <Link href={proj.url} color="primary" target="_blank" rel="noopener" variant="inherit">
                        <OpenInNew />
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </BaseCard>
  );
};

export default ListOfProjects;
