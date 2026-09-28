import { Routes, Route, Navigate } from "react-router";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ChatPage from "./pages/ChatPage";
import CallPage from "./pages/CallPage";
import AgentChatPage from './pages/AgentChatPage'
import NotificationPage from "./pages/NotificationPage";
import OnBoardPage from "./pages/OnBoardPage";
import { Toaster } from "react-hot-toast";
import useAuthUser from "./hooks/userAuthUser";
import Layout from "./components/Layout";
import { useThemeStore } from "./hooks/useThemeStore";
import PageLoader from "./components/PageLoader";
import FriendsPage from "./pages/FriendsPage";
import Agent from "./pages/Agent"
import { socket } from "./lib/socket";
import { useEffect } from "react";
import TestSupabase from './pages/TestSupabase'

function App() {

  // tanstack query

  // const { data: authData, error, isLoading } = useQuery({
  // queryKey: ["authUser"],
  // queryFn: () => fetchInstance("/auth/me"),
  // retry: false
  // queryFn: async () => {
  //   const res = await fetch(
  //     "https://jsonplaceholder.typicode.com/todos"
  //   );

  //   return res.json();
    
  // },
// });

const {authUser , isLoading} = useAuthUser()
const {theme} = useThemeStore()

  const isAuthenticated = Boolean(authUser)
  const isOnboarded = authUser?.isOnboarded

  useEffect(() => {
  if (isLoading) return;

  if (authUser && !socket.connected) {
    socket.connect();

//     socket.emit("send-message", {
//     receiverId: "123",
//     text: "Hello"
// });
  }

  if (!authUser && socket.connected) {
    socket.disconnect();
  }

  return () => {
    if (socket.connected) {
      socket.disconnect();
    }
  };
}, [authUser, isLoading]);
  
  if (isLoading){
    return <PageLoader/>
  }

  return (
    
    <div className="min-h-screen" data-theme={theme}>
     <Routes>
  <Route
    path="/"
    element={isAuthenticated && isOnboarded ? ( 
      <Layout showSidebar={true}>
    <HomePage />
    </Layout> ) : 
      (<Navigate to={isAuthenticated ? "/onboarding" : "/login"} replace /> )}
  />
  {/* Using replace is recommended for authentication redirects 
  because it replaces the current history entry, preventing users from pressing the back button and returning to the redirecting page. */}

  <Route
    path="/login"
    element={!isAuthenticated ? <LoginPage /> : <Navigate to="/onboarding" />}
  />

 

  <Route
    path="/signup"
    element={!isAuthenticated ? <SignupPage /> : <Navigate to="/" />}
  />

  <Route
    path="/chat/:id"
    element={isAuthenticated && isOnboarded ? ( 
      <Layout showSidebar={true}>
    <ChatPage />
    </Layout> ) : 
      (<Navigate to={isAuthenticated ? "/onboarding" : "/login"} replace /> )}  />


  <Route
    path="/call/:id"
    element={isAuthenticated && isOnboarded ? ( 
      <Layout showSidebar={true}>
    <CallPage />
    </Layout> ) : 
      (<Navigate to={isAuthenticated ? "/onboarding" : "/login"} replace /> )}
  />

  <Route
    path="/notifications"
    element={isAuthenticated && isOnboarded ? ( 
      <Layout showSidebar={true}>
    <NotificationPage />
    </Layout> ) : 
      (<Navigate to={isAuthenticated ? "/onboarding" : "/login"} replace /> )}  />

  <Route
    path="/onboarding"
    element={isAuthenticated ? <OnBoardPage /> : <Navigate to="/login" />}
  />

  <Route
    path="/friends"
    element={isAuthenticated && isOnboarded ? ( 
      <Layout showSidebar={true}>
    <FriendsPage />
    </Layout> ) : 
      (<Navigate to={isAuthenticated ? "/onboarding" : "/login"} replace /> )}
  />

   <Route
    path="/supabase"
    element={isAuthenticated && isOnboarded ? ( 
      <Layout showSidebar={true}>
    <TestSupabase />
    </Layout> ) : 
      (<Navigate to={isAuthenticated ? "/onboarding" : "/login"} replace /> )}
  />

  <Route
    path="/agents"
    element={isAuthenticated && isOnboarded ? ( 
      <Layout showSidebar={true}>
    <Agent />
    </Layout> ) : 
      (<Navigate to={isAuthenticated ? "/onboarding" : "/login"} replace /> )}  />

    <Route
  path="/agents/:agentId/chat"
  element={isAuthenticated && isOnboarded ? ( 
      <Layout showSidebar={true}>
    <AgentChatPage />
    </Layout> ) : 
      (<Navigate to={isAuthenticated ? "/onboarding" : "/login"} replace /> )}  />

</Routes>

<Toaster/>
    </div>
   
  )
}

export default App
