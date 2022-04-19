import { Route, BrowserRouter, Switch } from "react-router-dom";
import  Header  from "./components/Header";
import  TopPage  from "./pages/TopPage";
import  MainPage  from "./pages/MainPage";


const App = () => {
  return (
    <BrowserRouter>
      <Header />
      <Switch>
        <Route exact path="/">
          <TopPage />
        </Route>
        <Route exact path="/main">
          <MainPage />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
