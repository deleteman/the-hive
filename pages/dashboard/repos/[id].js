import { Box, Grid, Skeleton} from '@mui/material'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import BaseCard from '../../../src/components/baseCard/BaseCard'


function useRepo(repo_id) {
    const [repo, setRepo] = useState(null)

    async function loadRepo(id) {
        const resp = await fetch('/api/local_repos?action=details&repo_id=' + id)
        setRepo(await resp.json())
    }

    useEffect(() => {
        if(repo_id != undefined)
            loadRepo(repo_id)
    }, [repo_id])

    return [repo, setRepo, loadRepo]
}

const RepoDetails = () => {
   const router = useRouter()
   const { id } = router.query
   console.log("repo id:", id)
const {status} = useSession({
    required: true
  })

  const [repo, setRepo, reLoadRepo] = useRepo(id)

  useEffect(() => {
    //reLoadRepo(id)
  }, [id])

  return (
    <Grid container spacing={0}>
        {repo?  
            <BaseCard title={repo.full_name}>
                <Box sx={{ "& button": { mx: 1 } }}>
            
                </Box>
            </BaseCard>
    
        : <p>
           <Skeleton variant="rectangular" width={210} height={118} />
           <Skeleton variant="text" />
           <Skeleton variant="text" />
           <Skeleton variant="text" />
           <Skeleton variant="text" />
 
        </p>}
        <Grid item xs={12} lg={12}>
        </Grid>
    </Grid>
  )
}


RepoDetails.auth = true

export default RepoDetails