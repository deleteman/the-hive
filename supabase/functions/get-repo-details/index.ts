// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.131.0/http/server.ts"

console.log("Hello from get-repo-details!")

import { Octokit, App } from "https://cdn.skypack.dev/octokit?dts";
import { GH_APP_TOKEN } from "../_shared/constants.ts"
import { supabaseClient } from "../_shared/supabaseClient.ts";

const ghclient:Octokit = new Octokit({
    auth: GH_APP_TOKEN
})
export async function getRepoDetails(repo: string) {
    const results = await ghclient.request(`GET /repos/${repo}`)
    console.log(results)
    return results
}


serve(async (req) => {
  const { name, repo_id } = await req.json()

  const {data: details} = await getRepoDetails(name)


  const {name: repo_name, 
        description, 
        forks_count,
        watchers_count,
        open_issues_count,
        stargazers_count:stars_count,
        has_issues: has_issues_enabled, 
        has_wiki: has_wiki_enabled } = details

  const license_key = details.license?.key || ""
  const {error} = await supabaseClient.from('user_repos')
                        .update({
                          name: repo_name,
                          description,
                          license: license_key,
                          has_issues_enabled,
                          has_wiki_enabled
                        })
                        .eq('id', repo_id)

  if(error) {
    console.log("Error while updating repo ", name)
    console.log(error)
    return new Response(JSON.stringify({
      error: true,
      details: error
    }), { headers: { "Content-Type": "application/json" } })
  } 
  console.log("Repo ", name, " updated correctly")

  const {error: historicError} = await supabaseClient.from('historic_repo_data')
                                .upsert({
                                  repo_id,
                                  saved_at: (new Date()).toISOString().split("T")[0],
                                  forks_count,
                                  stars_count,
                                  watchers_count,
                                  open_issues_count
                                })

  if(historicError) {
    console.log("Error while saving/updating historic data for repo ", name)
    console.log(historicError)
    return new Response(JSON.stringify({
      error: true,
      details: historicError
    }), { headers: { "Content-Type": "application/json" } })
  }
  console.log("Historic data properly saved for ", name, "!")
  return new Response("done",
    { headers: { "Content-Type": "application/json" } },
  )
})

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.625_WdcF3KHqz5amU0x2X5WWHP-OEs_4qj0ssLNHzTs' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
