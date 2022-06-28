import {supabase as db } from '../utils/db'
import {logger } from '../utils/logger'

export async function getReposBy(field, value) {
    try {
        logger('info', "Getting repo by " + field + " with value " + value )
        let {error, data }= await db
                        .from('user_repos')
                        .select("*")
                        .eq(field,value)
        if(error) {
            logger('error', "Error while checking the repo...")
            logger('error', error)
            throw new Error(error)
        }

        return data
    } catch (e) {
        logger('error', "Error trying to get the repos from DB")
        logger('error', e)
        logger('error', "/Error trying to get the repos from DB")
        return -1
    }
}

export async function saveRepo(repo) {
    try {
        logger('info', "Checking if repo exists...")
        let {error, count}= await db
                        .from('user_repos')
                        .select('full_name', {count: 'exact', head: true})
                        .eq('full_name',repo.full_name)
        if(error) {
            logger('error', "Error while checking the repo...")
            logger('error', error)
            throw new Error(error)
        }
        logger('info', "Found " + count + " repos with that name (" + repo.full_name + ")")
        if(count == 0) {
            logger('info', "Saving the repo into the database...")
            logger('info', repo)
            let {error} = await db.from('user_repos').insert(repo)
            if(error) {
                logger('error', "Error while saving the repo into the DB")
                throw error
            }
            return true
        } else {
            return false
        }
    } catch (e) {
        logger('error', "Error trying to save repo into DB")
        logger('error', e)
        logger('error', "/Error trying to save repo into DB")
        return -1
    }
}