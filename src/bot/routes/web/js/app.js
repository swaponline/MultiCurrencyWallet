var Router = ReactRouterDOM.Router;
var Route = ReactRouterDOM.Route;
var Link = ReactRouterDOM.Link;
var BrowserRouter  = ReactRouterDOM.BrowserRouter;

const links = [
  { name: 'Bot', link: '/'},
  { name: 'Kraken', link: '/exchange'},
  { name: 'In Progress', link: '/in-progress'},
  { name: 'History', link: '/history'},
  { name: 'Statistics', link: '/stats'},
]

const Header = () => (
  <header>
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <ul className="navbar-nav mr-auto">

        {links.map((link) => (
          <li className="nav-item" key={link.link}>
            <Link className="nav-link" to={link.link}>{link.name}</Link>
          </li>
        ))}

        <li className="nav-item">
          <a className="nav-link" href="https://pmmonitor.swaponline.site/" target="_blank">Logs (pm2)</a>
        </li>

      </ul>
    </nav>
  </header>
)

class App extends React.Component {
  render() {
    return (
      <div>
        <Header />
        <div className="jumbotron" >
          <Route key={1} path="/" exact component={Bot} />
          <Route key={2} path="/exchange" exact component={Kraken} />
          <Route key={3} path="/in-progress" exact component={History} />
          <Route key={4} path="/history" exact component={History} />
          <Route key={5} path="/history/:ticker" exact component={History} />
          <Route key={6} path="/stats" exact component={Statistics} />
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <BrowserRouter>
    <App/>
  </BrowserRouter>,
  document.getElementById('main')
);
