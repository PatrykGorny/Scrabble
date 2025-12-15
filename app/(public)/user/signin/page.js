import { Suspense } from 'react'
import SignIn from './signIn'

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Ładowanie...</div>}>
      <SignIn />
    </Suspense>
  )
}
