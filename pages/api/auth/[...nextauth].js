import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import {saveUser} from '../../../src/models/users'
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
      await saveUser({
        name: user.name,
        email: user.email,
        avatar_url: user.image
      })
      return true
    }
  }
})