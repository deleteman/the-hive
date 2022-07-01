// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.131.0/http/server.ts"

console.log("Hello from get-repo-languages!")

import { Octokit, App } from "https://cdn.skypack.dev/octokit?dts";
import { GH_APP_TOKEN } from "../_shared/constants.ts"
import { supabaseClient } from "../_shared/supabaseClient.ts";

const ghclient:Octokit = new Octokit({
    auth: GH_APP_TOKEN
})
export async function getRepoLanguages(repo: string) {
    const results = await ghclient.request(`GET /repos/${repo}/languages`)
    console.log(results)
    return results
}

serve(async (req) => {
  const { name } = await req.json()
  console.log("Getting languages for repo: ", name)

  let {data: langs}= await getRepoLanguages(name)

  console.log("languages obtained: ")
  console.log(langs)

  const {error, data: repos}= await supabaseClient
                                    .from('user_repos')
                                    .select('id')
                                    .eq('full_name', name)

  if(error) {
    console.log("There was an error getting the details of repo: ", name)
    return new Response(JSON.stringify({
      error: true,
      details: error
    }), {
      status: 500,
      headers: {
        "Content-type": "application/json"
      }
    })
  }
  Object.keys(langs).forEach( async (l) => {
    const payload = {
                    repo_id: repos[0].id,
                    language: l,
                    bytes: langs[l]
                  }
    
    const {error} = await supabaseClient
                      .from('repo_languages')
                      .upsert(payload, {returning: 'minimal'})
    if(error) {
      console.log("Error while saving repo lang")
      console.log(payload)
    } else {
      console.log("Language saved ", l, "(", langs[l], "), for repo ", name)
    }
  })
  //update repo with languages

  return new Response(
    JSON.stringify(langs),
    { headers: { "Content-Type": "application/json" } },
  )
})

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.625_WdcF3KHqz5amU0x2X5WWHP-OEs_4qj0ssLNHzTs' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
