import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import LandingPage   from './pages/LandingPage';
import LoginPage     from './pages/LoginPage';
import MainPage      from './pages/MainPage';
import MyPage        from './pages/MyPage';
import AdminPage     from './pages/AdminPage';
import KakaoCallback from './pages/KakaoCallback';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<LandingPage />}
        />
        <Route
          path="/login"
          element={<LoginPage />}
        />
        <Route
          path="/order"
          element={<MainPage />}
        />
        <Route
          path="/main"
          element={<Navigate to="/order" replace />}
        />
        <Route
          path="/mypage"
          element={<MyPage />}
        />
        <Route
          path="/admin"
          element={<AdminPage />}
        />
        <Route
          path="/auth/kakao/success"
          element={<KakaoCallback />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;