import {
    Octokit
} from "@octokit/core";
import { saveRepo } from "../../../src/models/repos";
import { getUserBy } from "../../../src/models/users";
import {
    logger
} from "../../../src/utils/logger"

const methods = {
    'GET': findRepos,
    'POST': saveRepoHandler
}

const THROTTLE_VALUE = 200 //ms

async function saveRepoHandler(req, res, headers) {
    let {
        body: {
            repo_name
        }
    } = req


    let access_token = headers['github-token']

    const octokit = new Octokit({
        auth: access_token
    });

    logger('info', 'Getting data for ' + repo_name)
    let {data: repoData}= await octokit.request('GET /repos/' + repo_name)

    let user = await getUserBy('access_token', access_token)

    let repoModel = {
        user_id: user.id,
        name: repoData.name,
        full_name: repoData.full_name,
        url: repoData.html_url,
        description: repoData.description,
        license: repoData.license?.key,
        updated_at: new Date() //this is the first time we're saving it...
    }

    try {
        let saveRes = await saveRepo(repoModel)
        if(!saveRes) {
            logger('error', 'Unable to save repository, it already exists')
            return res.status(500)
                    .setHeader('Content-type', 'application/json')
                    .end(JSON.stringify( {
                        error: true,
                        details: "repo already exists"
                    }))
        }
        res.status(200)
            .setHeader('Content-type', 'application/json')
            .end(JSON.stringify(repoModel))
    } catch (e) {
        logger('error', 'Error trying to save the repo')
        logger('error', e)
        res.status(500)
            .setHeader('Content-type', 'application/json')
            .end(JSON.stringify({
                error: true,
                details: e
        }))
    }
}

/**
 *  Returns the list of repositories from a particular organization
 * @param {*} octokit 
 * @param {stirng[]} orgs the list of organization names
 * @param {string} q  the query to understand if we're filtering or not. If we're filtering, we need to keep querying all pages (otherwise one a single page)
 * @param {number} p  the initial page number. If we're filtering, then we'll query all pages, otherwise we'll just query the current one
 * @returns 
 */
function getReposFromOrgs(octokit, orgs, q, p) {
    let repos = []
    console.log("Iterating over " + orgs.data.length + " orgs...")
    return orgs.data.map(org => {
        return async function() {
            logger('info', "Getting public repos from org: " + org.login)
            let orgRepos = []
            do {
                let command = 'GET /orgs/' + org.login + '/repos'
                logger('info', 'command used: ' + command)
                orgRepos = await octokit.request(command, {
                    page: p
                })
                if (orgRepos.data && orgRepos.data.length > 0) {
                    repos = [...repos, ...orgRepos.data]
                }

                await new Promise(r => setTimeout(r, THROTTLE_VALUE)); //throtling just in case...
                p++;
            } while (orgRepos.data && (
                    (q.trim() != "" && orgRepos.data.length > 0) //if we're filtering, we need to keep querying
                    ||
                    q.trim() == "") //otherwise, we just query once
            )
            return repos
        }
    })
}

/**
 * returns the list of repositories from a user
 * @param {*} octokit 
 * @param {string} q the query string to filter. If we're filtering, we'll query all pages, otherwise we just query one
 * @param {number} p the current page, if we're not filtering, we'll only query the current page, otherwise we'll query all of them
 * @returns 
 */
async function getReposFromUser(octokit, q, p) {
    let repos = []
    let response = null;
    do {
        logger('info', "Querying for page " + p)
        response = await octokit.request("GET /user/repos", {
            page: p,
            visibility: 'public'
        });
        if (response.data && response.data.length > 0) {
            repos = [...response.data, ...repos]
        }

        p++
        await new Promise(r => setTimeout(r, THROTTLE_VALUE)); //throtling just in case...

    } while (
        response.data && (
            (q.trim() != "" && response.data.length > 0) //if we're filtering, we need to keep querying
            ||
            q.trim() == "")) //otherwise, we just query once
    console.log("==== resolving promise for user...")
    return repos
}

async function findRepos(req, res, headers) {

    let {
        query: {
            q,
            p
        }
    } = req

    let access_token = headers['github-token']

    const octokit = new Octokit({
        auth: access_token
    });

    try {
        let repos = []
        let filteredRepos = []

        logger('info', "Getting user orgs")
        let orgs = await octokit.request('GET /user/orgs')
        logger('info', "Orgs received: ")

        //Setting up list of functions to execute in parallel
        let fns = [...getReposFromOrgs(octokit, orgs, q, p), async () => await getReposFromUser(octokit, q, p)]

        //Executing everything with promise.all (ideally in parallel)
        let parallelResults = await Promise.all(fns.map(f => f()))

        //merge all results into a single array
        parallelResults.forEach(p => {
            repos = [...repos, ...p]
        })
        logger('info', 'Getting ' + repos.length + ' repositories')

        if (q.trim() != "") { //are we filtering?
            filteredRepos = repos.filter( function filterFN(r) {
                // case insensitive filtering
                return r.name.toLowerCase().indexOf(q.toLowerCase()) != -1
            })
        } else {
            filteredRepos = repos
        }

        logger('info', 'Repos returned: ' + filteredRepos.length)

        res
            .setHeader("Content-type", "application/json")
            .status(200)
            .end(JSON.stringify(filteredRepos))
    } catch (githubError) {
        console.trace("There was a problem querying Github's API")
        logger(githubError)
        res.status(500).end(JSON.stringify({
            error: true,
            details: githubError
        }))
    }
}

export default function handler(req, res) {
    const {
        query: {
            q
        },
        method,
        headers
    } = req


    logger('info', "Request method: " + method)
    logger('info', "Filter query: " + q)


    if (Object.keys(methods).indexOf(method) != -1) {
        methods[method](req, res, headers)
    } else {
        logger("error", "Invalid method!")
        res.status(405).end(`Method ${method} Not Allowed`)
    }
}
