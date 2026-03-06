import { useState } from 'react'
import Login from './Login'
import Signup from './Signup'

function AuthPage({ t }) {
  const [isLogin, setIsLogin] = useState(true)

  return isLogin ? (
    <Login onSwitch={() => setIsLogin(false)} t={t} />
  ) : (
    <Signup onSwitch={() => setIsLogin(true)} t={t} />
  )
}

export default AuthPage
