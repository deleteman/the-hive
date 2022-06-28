import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Alert, Box, CircularProgress, Grid, Skeleton, Stack, TextField, Typography } from '@mui/material';
import { ArrowDownward, FilterList, FormatListBulleted, Search } from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import styled from '@emotion/styled';
import Paper from '@mui/material/Paper';
import AlertModal from './AlertModal';



const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'left',
  color: theme.palette.text.secondary,
}));

export default function FilterGithubReposModal() {
  const [open, setOpen] = useState(false);
  const [scroll, setScroll] = useState('paper');
  const [searchingRepos, setSearchingRepos] = useState(false)
  const [queryString, setQueryString] = useState("")
  const [foundRepos, setFoundRepos] = useState([])
  const [noReposMsg, setNoReposMsg] = useState(false)
  const [importingRepo, setImportingRepo] = useState("")
  const [alertError, setAlertError] = useState("")
  const {status, data} = useSession()
  
  const handleClickOpen = (scrollType) => () => {
    setOpen(true);
    setScroll(scrollType);
  };
  
  const handleClose = () => {
    setOpen(false);
  };
  
  const handleFind = async (evnt) => {
    evnt.preventDefault()
    const filterBy = document.getElementById("reponame").value
    
    setFoundRepos([])
    setNoReposMsg(false)
    setSearchingRepos(true)
    let resp = await fetch('/api/repos?q=' + filterBy + '&p=1', {
      headers: {
        "github-token": data.user.access_token
      }
    })
    setSearchingRepos(false)
    let repos = await resp.json()
    if(repos.length == 0) {
      setNoReposMsg(true)
    } else {
      setFoundRepos(repos)
    }
  }
  
  const importRepo = async (repoName) => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repo_name: repoName })
    };
    
    setImportingRepo(repoName)
    try {
      let resp = await fetch('/api/repos', requestOptions).catch(error => {
        throw new Error(error)
      })
      if(resp.status != 200) throw new Error(await resp.text())
      let jsonResp = await resp.json()
      console.log(jsonResp)
      if(jsonResp.error) {
        setAlertError(jsonResp.error)
      }
    } catch(e) {
      setAlertError(e)
    }
    setImportingRepo("")
    
    
  }
  
  const descriptionElementRef = React.useRef(null);
  React.useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);
  
  return (
    <span>
    <Button onClick={handleClickOpen('paper')} color="primary" size="small" variant="contained">
    Import new repo
    </Button>
    <Dialog
    open={open}
    onClose={handleClose}
    scroll={scroll}
    aria-labelledby="scroll-dialog-title"
    aria-describedby="scroll-dialog-description"
    >
    <DialogTitle id="scroll-dialog-title">Find your Repo</DialogTitle>
    <DialogContent dividers={scroll === 'paper'}>
    <DialogContentText
    id="scroll-dialog-description"
    ref={descriptionElementRef}
    tabIndex={-1}
    >
    Use the following field to search for the repos you'd like to import into The Hive 
    </DialogContentText>
    <form onSubmit={handleFind}>
    <TextField
    autoFocus
    margin="dense"
    id="reponame"
    label="Repo name"
    type="reponame"
    variant="filled"
    fullWidth
    
    onChange={() => {
      setQueryString(document.getElementById('reponame').value)
    }}
    /></form>
    <Stack direction="row" spacing={2}>
    <Button variant='contained' endIcon={<Search />} onClick={handleFind} disabled={queryString.length == 0}>Search</Button>
    </Stack>
    <Grid container spacing={0} rowSpacing={1}>
    {searchingRepos && <Grid item xs={12}>
    <Skeleton variant="text" />
    <Skeleton variant="text" />
    <Skeleton variant="text" />
    </Grid>
  }
  {noReposMsg && <Alert severity='info'>There were no repos found for that query</Alert>}
  <AlertModal title="Error while importing repo" error={alertError} open={alertError != ""} closer={() => setAlertError("")}/>
  {foundRepos.map( r => {
    return (
      <>
      <Grid item xs={11}>
      <Item>
      {r.full_name}
      </Item>
      </Grid>
      <Grid item xs={1}>
      <Button variant='text' disabled={importingRepo != "" && (importingRepo != r.full_name)} onClick={() => importRepo(r.full_name)}>
      { (importingRepo == r.full_name)?
        <CircularProgress size={20} />
        : <ArrowDownward />}
        
        </Button>
        </Grid>
        </>
        )
      })}
      </Grid>
      </DialogContent>
      <DialogActions>
      <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
      </Dialog>
      </span>
      );
    }
    