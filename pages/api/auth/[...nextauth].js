import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import {saveUser, getUserByEmail} from '../../../src/models/users'
import {logger} from '../../../src/utils/logger'

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    // ...add more providers here
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      logger('info', "--- User logged in--")
      logger('info', user)
      logger('info', account)
      logger('info', credentials)
      logger('info', profile)
      await saveUser({
        name: user.name,
        email: user.email,
        avatar_url: user.image,
        access_token: account.access_token
      })
      return true
    },
    async session({session, token, user}) {
      session.user.avatar_url = session.user.image
      if(!session.user.access_token) {
        let token = await getUserByEmail(session.user.email, 'access_token')
        session.user.access_token = token.access_token
      }
      console.log(session)
      return session
    }
  }
})