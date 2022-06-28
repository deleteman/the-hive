import { Octokit } from "@octokit/core";
import { logger } from "../../../src/utils/logger"

const methods = {
    'GET': findRepos,
    'POST': saveRepo
}

function saveRepo(req, res) {

    res.status(404).end('endpoint not found yet...')
}

async function findRepos(req, res, headers) {
    
    let {
        query: {q, p}
    } = req
    
    let access_token = headers['github-token']
    
    const octokit = new Octokit({ auth: access_token });
    
    try {
        let repos = []
        let response = null;
        do {
            logger('info', "Querying for page " + p)
            response = await octokit.request("GET /user/repos", {
                page: p,
                visibility: 'public'
            } );
            if(response.data && response.data.length > 0) {
                repos = [...response.data, ...repos]
            }
                
            p++
            await new Promise(r => setTimeout(r, 500)); //throtling just in case...

        } while(
            response.data && (
            (q.trim() != "" && response.data.length > 0)  //if we're filtering, we need to keep querying
            || q.trim() == "")) //otherwise, we just query once

        let filteredRepos = repos
        
        logger('info', 'Getting ' + repos.length + ' repositories')
        
        if(q.trim() != "") { //are we filtering?
            filteredRepos = repos.filter( r => {
                return r.full_name.indexOf(q) != -1
            })
        }
        
        logger('info', 'Repos returned: ' + filteredRepos.length)
        
        res
        .setHeader("Content-type", "application/json")
        .status(200)
        .end(JSON.stringify(filteredRepos))
    } catch (githubError ) {
        logger('error', "There was a problem querying Github's API")
        logger(githubError)
        res.status(500).end(JSON.stringify({
            error: true, 
            details: githubError
        }))
    }
}

export default function handler(req, res) {
    const {
        query: { q },
        method,
        headers
    } = req
    
    
    logger('info', "Request method: " + method)
    logger('info', "Filter query: " + q)
    
    
    if(Object.keys(methods).indexOf(method) != -1) {
        methods[method](req, res, headers)
    } else {
        logger("error", "Invalid method!")
        res.status(405).end(`Method ${method} Not Allowed`)
    }
}