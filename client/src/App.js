import { Route, BrowserRouter, Switch } from "react-router-dom";
import  Header  from "./components/Header"
import  TopPage  from "./pages/TopPage"

const App = () => {
  return (
    <BrowserRouter>
      <Header />
      <Switch>
        <Route exact path="/">
          <TopPage />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
