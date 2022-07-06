import { getReposBy, updateRepo, getFullRepoDetailsBy } from "../../../src/models/repos"
import {
    logger
} from "../../../src/utils/logger"

const methods = {
    'GET': listLocalrepos,
    'POST': publishRepo
}

const GET_ACTIONS = {
    'details': getRepoDetails
}

async function getRepoDetails(repo_id) {
    const response = await getFullRepoDetailsBy('id', repo_id, {sortBy:'name'})
    return response[0]
}

async function publishRepo(req, res) {

    const {
        body: {
            repo_name,
            action
        }
    } = req

    let upRes = await updateRepo({
        published: action == "publish",
        published_date: new Date(Date.now()).toISOString().replace('T',' ').replace('Z','')
    }, {
        key: 'full_name',
        value: repo_name
    })

    let statusCode = 200;
    let resp = ""

    if(upRes == -1) {
        statusCode = 500;
        resp = {
            error: true,
            details: "There was a problem updating the record for this repo"
        }
    }
    res.status(statusCode)
        .setHeader('Content-type', 'application/json')
        .end(JSON.stringify(resp))

}

async function listLocalrepos(req, res) {
    const {
        query: {
            user_id,
            action
        }
    } = req

    let response = null
    if(action && Object.keys(GET_ACTIONS).indexOf(action) != -1) {
        logger('info', 'Action: ', action)
        response = await GET_ACTIONS[action](req.query.repo_id)
    } else {
        response = await getReposBy('user_id', user_id, {sortBy: 'name'})
        logger('info', 'Found ' + response.length + ' repos for user')
    }


    res.status(200)
    res.setHeader('Content-type', 'application/json')
    res.end(JSON.stringify(response))
}

export default async function handler(req, res) {
    const {
        query: {
            q
        },
        method,
        headers
    } = req


    if (Object.keys(methods).indexOf(method) != -1) {
        await methods[method](req, res, headers)
    } else {
        logger("error", "Invalid method!")
        res.status(405).end(`Method ${method} Not Allowed`)
    }
}