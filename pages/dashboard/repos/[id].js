import { Typography, Stack, Chip,  Box, Grid, Skeleton} from '@mui/material'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import BaseCard from '../../../src/components/baseCard/BaseCard'
import RepoCard from '../../../src/components/baseCard/RepoCard'
import dynamic from "next/dynamic";
import { FormatListNumbered } from '@mui/icons-material'
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });


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
            <RepoCard title={repo.full_name} last_commit={repo.last_commit_at}>
                <Stack direction="row" spacing={2}>
                    <Box xs={{ "& button": { mx: 1 } }}>
                        {repo.description}
                    </Box>
                    <Chart
                        options={ {
                            labels: repo.repo_languages.map( l => l.language),
                            tooltip: {
                                enabled: true,
                                y: {
                                    formatter: (val) =>{ 
                                        return val + " bytes"
                                    }
                                }
                            }
                        }}
                        series={repo.repo_languages.map(l => l.bytes)}
                        type="pie"
                        height="295px"
                    />
                </Stack>
                
                <Grid container>
                    <Grid item xs={4}>
                        <Stack spacing={2}>
                            <Chip
                            sx={{
                                pl: "4px",
                                pr: "4px",
                                backgroundColor: (repo.has_issues_enabled? "success.main" : "error.main"),
                                color: "#fff",
                            }}
                            size="small"
                            label={"Has issues enabled:" + (repo.has_issues_enabled? "Yes": "No")}
                            ></Chip>
                            <Chip
                            sx={{
                                pl: "4px",
                                pr: "4px",
                                backgroundColor: (repo.has_wiki_enabled? "success.main" : "error.main"),
                                color: "#fff",
                            }}
                            size="small"
                            label={"Has Wiki enabled:" + (repo.has_wiki_enabled? "Yes": "No")}
                            ></Chip> 
                        </Stack>
                    </Grid>
                </Grid>
                <Grid item xs={2}>
                    <Stack direction="row" spacing={2}>
                        <Typography >
                            License: 
                        </Typography>
                        <Chip
                            sx={{
                                pl: "4px",
                                pr: "4px",
                                backgroundColor: (repo.license ? "success.main" : "error.main"),
                                color: "#fff",
                            }}
                            size="small"
                            label={(repo.license ? repo.license: "No")}
                        ></Chip>
              
                    </Stack>
                    
                </Grid>
                <Grid item xs={12}>
                <Stack>
                        <h2>Pull Requests data</h2>
                        <Chart
                        options={ {
                            xaxis: {
                                type: 'datetime',
                                categories: repo.historic_repo_pulls.map( p => p.saved_at)
                            }
                        }}
                        series={[
                            {
                                name: "Closed pulls",
                                data: repo.historic_repo_pulls.map( p => {
                                    return {
                                        x: new Date(p.saved_at).getTime(),
                                        y: p.closed_pulls_count
                                    }
                                })
                            },
                            {
                                name: "Open pulls",
                                data: repo.historic_repo_pulls.map( p => {
                                    return {
                                        x: new Date(p.saved_at).getTime(),
                                        y: p.open_pulls_count
                                    }
                                })
                            }
                        ]}
                        stroke = {{
                            curve: 'smooth'
                        }}
                        type="line"
                        height="295px"
                    />

                    </Stack>
                </Grid>
                <Grid item xs={12}>
                    <Stack>
                        <h2>Popularity data</h2>
                        <Chart
                        options={ {
                            xaxis: {
                                type: 'datetime',
                                categories: repo.historic_repo_pulls.map( p => p.saved_at)
                            }
                        }}
                        series={[
                            {
                                name: "Stars",
                                data: repo.historic_repo_data.map( p => {
                                    return {
                                        x: new Date(p.saved_at).getTime(),
                                        y: p.stars_count
                                    }
                                })
                            },
                            {
                                name: "Forks",
                                data: repo.historic_repo_data.map( p => {
                                    return {
                                        x: new Date(p.saved_at).getTime(),
                                        y: p.forks_count
                                    }
                                })
                            }
                        ]}
                        stroke = {{
                            curve: 'smooth'
                        }}
                        type="line"
                        height="295px"
                    />

                    </Stack>
                </Grid>
                <Grid item xs={12}>
                    <Stack direction={"row"} spacing={10}>
                        <div>
                            <h2>Issues data</h2>
                            <Chart
                            options={ {
                                xaxis: {
                                    type: 'datetime',
                                    categories: repo.historic_repo_issues.map( p => p.saved_at)
                                }
                            }}
                            series={[
                                {
                                    name: "Open issues",
                                    data: repo.historic_repo_issues.map( p => {
                                        return {
                                            x: new Date(p.saved_at).getTime(),
                                            y: p.open_issues
                                        }
                                    })
                                },
                                {
                                    name: "Closed issues",
                                    data: repo.historic_repo_issues.map( p => {
                                        return {
                                            x: new Date(p.saved_at).getTime(),
                                            y: p.closed_issues
                                        }
                                    })
                                }
                            ]}
                            stroke = {{
                                curve: 'smooth'
                            }}
                            type="line"
                            height="295px"
                        />
                     </div>
                     <div>
                        <h2>Avg time to close issues</h2>
                        <Chart
                        options={ {
                            xaxis: {
                                type: 'datetime',
                                categories: repo.historic_repo_issues.map( p => p.saved_at)
                            },
                            yaxis: {
                                title: {
                                    text: "Days"
                                }
                            }
                        }}
                        series={[
                            {
                                name: "Avg time to close",
                                data: repo.historic_repo_issues.map( p => {
                                    return {
                                        x: new Date(p.saved_at).getTime(),
                                        y: Math.round(((p.avg_time_to_close / 60) / 60) / 24) //calculated in days
                                    }
                                })
                            }
                        ]}
                        stroke = {{
                            curve: 'smooth'
                        }}
                        type="line"
                        height="295px"
                    />
                    </div>
                    </Stack>
                </Grid>
            </RepoCard>
    
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