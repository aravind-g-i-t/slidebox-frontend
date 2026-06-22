import { ToastProvider } from "./providers/ToastProvider"
import AppRoutes from "./routes/AppRoutes"


function App() {

  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  )
}

export default App
