import React, { useState } from "react";
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
  Button,
  CircularProgress,
} from "@mui/material";
import {OpenInNew, OpenWithOutlined} from "@mui/icons-material"
import BaseCard from "../baseCard/BaseCard";


const ListOfProjects = ({repos, updater}) => {
  const [publishing, setPublishing] = useState(0)
 
  async function toggleProject(proj) {
    let url = '/api/local_repos'
    setPublishing(proj.id)
    let resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        repo_name: proj.full_name,
        action: proj.published ? 'unpublish' : 'publish'
      })
    })
    updater()
    setPublishing(0)
  }

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
            <TableCell>
              <Typography color="textSecondary" variant="h6">
                Actions
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {repos.map((proj) => (
            <TableRow key={proj.id}>
              <TableCell>
                <Link href={"/dashboard/repos/" + proj.id}>
                <Typography
                  sx={{
                    fontSize: "15px",
                    fontWeight: "500",
                  }}
                >
                  {proj.full_name}
                </Typography>
              </Link >
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
                        <OpenInNew fontSize="small"/>
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
             <TableCell>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Box>
                   <Button color={proj.published ? "secondary" : "primary"} size="small" variant="contained" onClick={() => toggleProject(proj)}>
                      {proj.published ? "Unpublish" : "Publish"} 
                      {publishing == proj.id && 
                      <CircularProgress size={20}/>
                      }
                    </Button> 
                  

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
