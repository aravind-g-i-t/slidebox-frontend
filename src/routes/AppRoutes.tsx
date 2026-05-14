import { Navigate, Route, Routes } from "react-router-dom"
import SigninPage from "../pages/SigninPage"
import SignupPage from "../pages/SignupPage"
import HomePage from "../pages/HomePage"
import VerifyOtpPage from "../pages/VerifyOTPPage"
import { useSelector } from "react-redux"
import type { RootState } from "../redux/store"
import MockHome from "../pages/MockHome"


const AppRoutes = () => {
  const {user}=useSelector((state:RootState)=>state.user)
  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? <Navigate to={"/home"} replace /> : <Navigate to="/signin" replace />
        }
      />
     {!user && <Route path="/signin" element={<SigninPage/>}/>}
      {!user && <Route path="/signup" element={<SignupPage/>}/>}
      {!user && <Route path="/verify-otp" element={<VerifyOtpPage/>}/>}
      {user && <Route path="/home" element={<HomePage/>}/>}
      <Route path="/mockhome" element={<MockHome/>}/>
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}

export default AppRoutes
