import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter, Route, Link } from "react-router-dom";
import OtherPage from "./OtherPage";
import Fib from "./Fib";

function App() {
  return (
    <BrowserRouter>
      <Route exact path="/" component={Fib} />
      <Route path="/otherpage" component={OtherPage} />
    </BrowserRouter>
  );
}

export default App;
