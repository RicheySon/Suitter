import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "../components/theme-provider";
import Layout from "./Layout";
import HomePage from "./pages/HomePage";
import FeedPage from "./pages/FeedPage";
import ExplorePage from "./pages/ExplorePage";
import BookmarksPage from "./pages/BookmarksPage";
import MessagesPage from "./pages/MessagesPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import SuitsPage from "./pages/SuitsPage";
import AssetsPage from "./pages/AssetsPage";
import { AppProvider } from "@/components/providers/AppProvider";

function App() {
  return (
    <AppProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="feed" element={<FeedPage />} />
              <Route path="explore" element={<ExplorePage />} />
              <Route path="bookmarks" element={<BookmarksPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="suits" element={<SuitsPage />} />
              <Route path="assets" element={<AssetsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AppProvider>
  );
}

export default App;
