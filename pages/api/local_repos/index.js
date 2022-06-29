import { getReposBy, updateRepo } from "../../../src/models/repos"
import {
    logger
} from "../../../src/utils/logger"

const methods = {
    'GET': listLocalrepos,
    'POST': publishRepo
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
            user_id
        }
    } = req

    let repos = await getReposBy('user_id', user_id, {sortBy: 'name'})
    logger('info', 'Found ' + repos.length + ' repos for user')

    res.status(200)
        .setHeader('Content-type', 'application/json')
        .end(JSON.stringify(repos))
}

export default function handler(req, res) {
    const {
        query: {
            q
        },
        method,
        headers
    } = req


    if (Object.keys(methods).indexOf(method) != -1) {
        methods[method](req, res, headers)
    } else {
        logger("error", "Invalid method!")
        res.status(405).end(`Method ${method} Not Allowed`)
    }
}