import {supabase as db } from '../utils/db'
import {logger } from '../utils/logger'

export async function getUserByEmail(email, fields = "*") {
    try {
        let {error, data} = await db 
                            .from('users')
                            .select(fields)
                            .eq('email', email)

        if(error) {
            logger('error', "Error while getting user by email. Email used: " + email)
            throw new Error(error)
        }
        logger('info', 'Data received: ')
        logger('info', data)
        return data[0]
    } catch (e) {
        logger('error', "There was an error trying to query the database")
        logger('error', e)
    }
}

export async function saveUser(usr) {

    try {
        logger('info', "Checking if user exists...")
        let {error, count}= await db
                        .from('users')
                        .select('email', {count: 'exact', head: true})
                        .eq('email',usr.email)
        if(error) {
            logger('error', "Error while checking the user...")
            logger('error', error)
            throw new Error(error)
        }
        logger('info', "Found " + count + " users with that email (" + usr.email + ")")
        if(count == 0) {
            logger('info', "Saving the user into the database...")
            let {error} = await db.from('users').insert(usr)
            if(error) {
                logger('error', "Error while saving the user into the DB")
                throw new Error(error)
            }
            return 
        }
    } catch (e) {
        console.log("Error trying to save user into DB")
        console.error(e)
        console.log("/Error trying to save user into DB")
    }

}