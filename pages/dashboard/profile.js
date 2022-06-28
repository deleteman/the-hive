import { Grid, Avatar } from "@mui/material";
import ProfileCard from "../../src/components/baseCard/ProfileCard"
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';


import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import ListOfProjects from "../../src/components/dashboard/ListOfProjects";
import FilterGithubReposModal from "../../src/components/dashboard/FilterGithubReposModal";


export async function getServerSideProps(context) {
    return {
        props: {
            repos: [
                {name: "The Hive", github_url: "https://github.com/deleteman/the-hive"},
                {name: "Vatican", github_url: "https://github.com/deleteman/vatican"},
                {name: "lfpr", github_url: "https://github.com/deleteman/lfpr"},
            ]
        }
    }
}

function Profile({repos}) {

  const {status, data} = useSession({
    required: true
  })
  const [me, setMe] = useState({})

  useEffect(() => {
      console.log("setting user")
      console.log(data)
    if(status == 'authenticated') {
        console.log("is authed")
        setMe(data.user)
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