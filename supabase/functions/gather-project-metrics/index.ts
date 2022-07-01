// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.131.0/http/server.ts"
import { supabaseClient } from "../_shared/supabaseClient.ts"
import { response } from "../_shared/utils.ts"

console.log("Hello from gather-project-metrics")


serve(async (req) => {

  const {error, data: repos}= await supabaseClient
                .from('user_repos')
                .select('full_name, id')
                .eq('published', true)

  if(error) {
    console.log("Error getting the list of published repos....")
    console.log(error)
    return new Response(JSON.stringify({
      error: true,
      details: error
    }),{ headers: { "Content-Type": "application/json" } } )
  }
  console.log("Repos found: ", repos.length)

  //get languages for a repo: GET /repos/{owner}/{repo}/languages (done)
  //get repo details: GET /repos/{owner}/{repo} (done)
  //get PRs from a project: GET /repos/{owner}/{repo}/pulls (done)
  //get issues from a repo: GET /repos/{owner}/{repo}/issues (done)
  //get commits from a repo: GET /repos/{owner}/{repo}/commits (done)
  //get overall repo community profile: GET /repos/{owner}/{repo}/community/profile (skip)
  //get number of clones of a repo in the last 14 days: GET /repos/{owner}/{repo}/traffic/clones (skip)

  const functionNames:string[] = [
    "get-repo-languages",
    "get-repo-details",
    "get-repo-pulls",
    "get-repo-issues",
    "get-repo-commits"
  ]

  repos?.forEach(r => { //for each repo
    functionNames.forEach( async (fn) => { //we execute every single function
      console.log("Invoking function ", fn, " for repo ", r)
      const {error} = await supabaseClient.functions.invoke(fn, {
        body: JSON.stringify({
          name: r.full_name,
          repo_id: r.id
        })
      })
      if(error) {
        console.log(error)
      }
    })
    
  })

  //let results = await Promise.all(execQueue.map( q => q()))


  return response("done")
})

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.625_WdcF3KHqz5amU0x2X5WWHP-OEs_4qj0ssLNHzTs' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
