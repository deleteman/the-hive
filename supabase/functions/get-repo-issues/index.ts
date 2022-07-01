// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.131.0/http/server.ts"
import { difference, parse } from "https://deno.land/std@0.146.0/datetime/mod.ts";

import {response} from "../_shared/utils.ts"

console.log("Hello from get-repo-issues ")

import { Octokit } from "https://cdn.skypack.dev/octokit?dts";
import { GH_APP_TOKEN } from "../_shared/constants.ts"
import { supabaseClient } from "../_shared/supabaseClient.ts";

const ghclient:Octokit = new Octokit({
    auth: GH_APP_TOKEN
})


const GH_DATE_FORMAT ="yyyy-MM-ddTHH:mm:ssZ" 


type StateCounters = {
  [key: string]: number,
}

type AvgTimers = {
  time_to_close:number[]
}
type PullRequesData = {
  url: string,
  html_url: string,
  diff_url: string,
  patch_url: string,
  merged_at: string | null
}

type IssueData= {
    "state": string,
    "created_at": string,
    "title": string,
    "closed_at": string,
    "pull_request": PullRequesData|null
}

export async function getRepoIssues(repo: string) {
    const results = await ghclient.request(`GET /repos/${repo}/issues`, {
      state: "all"
    })
    console.log(results)
    //calculate metrics inside this function
    const counters: StateCounters = {
      "open": 0,
      "closed": 0
    }
    const timers:AvgTimers = {
      time_to_close: [],
    }
    //This API mixes issues and PRs (read docs), so I'm filtering out issues that are coming from PRs
    results.data.filter( (p: IssueData) => !p.pull_request).forEach( (p: IssueData) => {
      const key: string = p.state
      if(key in counters) {
        counters[key] += 1
      }
      const createdDate = parse(p.created_at, GH_DATE_FORMAT)
      if(p.closed_at) {
        const closedDate = parse(p.closed_at, GH_DATE_FORMAT)
        timers.time_to_close.push(difference(closedDate, createdDate, {units: ["seconds"]}).seconds || 0)
      }
    })
    const averages = {
      avg_time_to_close: 0,
    }
    if(timers.time_to_close.length > 0 )
      averages.avg_time_to_close = Math.round(timers.time_to_close.reduce((prev, curr) => prev + curr, 0) / timers.time_to_close.length)

    return {
      open_issues: counters['open'],
      closed_issues: counters['closed'],
      avg_time_to_close: averages.avg_time_to_close
    }
}

serve(async (req) => {
  const { name, repo_id } = await req.json()

  const issueData = await getRepoIssues(name)

  const {error} = await supabaseClient.from('historic_repo_issues')
                    .upsert({
                      repo_id,
                      saved_at: (new Date()).toISOString().split("T")[0],
                      open_issues: issueData.open_issues,
                      closed_issues: issueData.closed_issues,
                      avg_time_to_close: issueData.avg_time_to_close
                    })

  if(error) {
    console.log("Error upserting data for repo ", name)
    console.log(error)
    return response({
      error: true,
      details: error
    })
  }

  return response("done") 
})

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.625_WdcF3KHqz5amU0x2X5WWHP-OEs_4qj0ssLNHzTs' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"deleteman/vatican", "repo_id": "8"}'
