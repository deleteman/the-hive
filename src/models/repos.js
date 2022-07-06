import {supabase as db } from '../utils/db'
import {logger } from '../utils/logger'

const TABLE_NAME = 'user_repos'

export async function updateRepo(data, {key, value}) {
    try {
        logger('info', "Updating a repository...")
        logger('info', 'Values: ')
        logger('info', data)
        logger('info', 'key: ' + key)
        logger('info', 'match value: ' + value)

        let {error} = await db 
                            .from(TABLE_NAME)
                            .update(data, {returning: 'minimal'})
                            .eq(key, value)
        
        if(error) {
            logger('error', "Error while updating the repo...")
            logger('error', error)
            throw new Error(error)
        }
        return true
    } catch (e) {
        logger('error', "Error trying to update a repo from DB")
        logger('error', e)
        logger('error', "/Error trying to update a repo from DB")
        return -1
    }


}

export async function getFullRepoDetailsBy(field, value, {sortBy = 'name'}) {
  try {
        logger('info', "Getting full repo details by " + field + " with value " + value )
        const {error, data }= await db
                            .from(TABLE_NAME)

                            .select(`*,
                                    repo_languages(
                                      language,
                                      bytes)`)
                            .order(sortBy)
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

export async function getReposBy(field, value, {sortBy = 'name'}) {
    try {
        logger('info', "Getting repo by " + field + " with value " + value )
        let {error, data }= await db
                        .from(TABLE_NAME)
                        .select("*")
                        .order(sortBy)
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
                        .from(TABLE_NAME)
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