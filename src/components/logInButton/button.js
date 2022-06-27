import { useSession, signIn, signOut } from "next-auth/react"
import Button from '@mui/material/Button';
export default function Component() {
  const { data: session } = useSession()
  if (session) {
    return (
      <>
        Signed in as {session.user.email} <br />
        <Button variant="contained" onClick={() => signOut()}>Sign out</Button>
      </>
    )
  }
  return (
    <>
      Not signed in <br />
        <Button variant="contained" onClick={() => signIn('github', {callbackUrl: '/dashboard'})}>Sign in</Button>
    </>
  )
}