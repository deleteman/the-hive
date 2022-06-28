import { getReposBy } from "../../../src/models/repos"
import {
    logger
} from "../../../src/utils/logger"

const methods = {
    'GET': listLocalrepos,
}

async function listLocalrepos(req, res) {
    const {
        query: {
            user_id
        }
    } = req

    let repos = await getReposBy('user_id', user_id)
    logger('info', 'Repos found for user')
    logger('info', repos)

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