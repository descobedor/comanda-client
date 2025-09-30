import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MainApp from "./MainApp";
import JoinPage from "./JoinPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/join/:uuid" element={<JoinPage />} />
      </Routes>
    </Router>
  );
}

export default App;
