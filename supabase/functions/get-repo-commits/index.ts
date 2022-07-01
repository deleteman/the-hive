// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.131.0/http/server.ts"
import { parse } from "https://deno.land/std@0.146.0/datetime/mod.ts";

import {response} from "../_shared/utils.ts"

console.log("Hello from get-repo-commits")

import { Octokit } from "https://cdn.skypack.dev/octokit?dts";
import { GH_APP_TOKEN } from "../_shared/constants.ts"
import { supabaseClient } from "../_shared/supabaseClient.ts";

const ghclient:Octokit = new Octokit({
    auth: GH_APP_TOKEN
})


const GH_DATE_FORMAT ="yyyy-MM-ddTHH:mm:ssZ" 



type Commit = {
  sha: string,
  commit: {
    committer: {
      date: string
    }
  }
}

export async function getLastCommitDate(repo: string) {
    const results = await ghclient.request(`GET /repos/${repo}/commits`, {
      per_page: 1,
      page: 1
    })
    console.log(results)
    results.data.forEach((c: Commit) => {
      console.log(c.sha, "-", c.commit?.committer?.date)
    })

    if(results.data.length > 0) {
      return parse(results.data[0].commit.committer.date, GH_DATE_FORMAT)
    } else {
      return ""
    }

}

serve(async (req) => {
  const { name, repo_id } = await req.json()

  const lastCommitDate:Date|string = await getLastCommitDate(name)

  const {error} = await supabaseClient.from('user_repos')
                    .update({
                      last_commit_at: lastCommitDate
                    })
                    .eq('id', repo_id)

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
//   --data '{"name":"Functions"}'
