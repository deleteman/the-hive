import { Grid, Avatar } from "@mui/material";
import ProfileCard from "../../src/components/baseCard/ProfileCard"
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';


import {  getSession, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import ListOfProjects from "../../src/components/dashboard/ListOfProjects";
import FilterGithubReposModal from "../../src/components/dashboard/FilterGithubReposModal";

function Profile({}) {
    
    const {status, data: sessionData} = useSession({
        required: true
    })
    const [me, setMe] = useState({})
    const [repos, setRepos] = useState([])

    async function getRepos() {
        const url = "/api/local_repos?user_id=" + sessionData.user.id
        let reposResp = await fetch(url)
        setRepos(await reposResp.json())
    }
    useEffect(() => {
        if(status == 'authenticated') {
            setMe(sessionData.user)
            getRepos()
        }
    }, [status])
    
    return (
        <Grid container spacing={0}>
        <ProfileCard avatar_url={me.avatar_url} title={me.name}>
        <Box sx={{ "& button": { mx: 1 } }}>
        <FilterGithubReposModal />
        <Button color="error" size="small" variant="contained">
        Other option
        </Button>
        <Button color="secondary" size="small" variant="contained">
        Other option
        </Button>
        </Box>
        </ProfileCard>
        
        {/* ------------------------- row 1 ------------------------- */}
        <Grid item xs={12} lg={12}>
        <ListOfProjects repos={repos} />
        </Grid>
        </Grid>
        );
    }
    
    Profile.auth = true
    
    export default Profile