import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import {saveUser, getUserByEmail, saveUserOrUpdate} from '../../../src/models/users'
import {logger} from '../../../src/utils/logger'

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      authorization: {
        params: {
          scope: 'repo read:user user:email read:org',
        },
      },
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
      await saveUserOrUpdate({
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
        let token = await getUserByEmail(session.user.email, 'access_token, id')
        session.user.access_token = token.access_token
        session.user.id = token.id
      }
      console.log(session)
      return session
    }
  }
})