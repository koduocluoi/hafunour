import React, {Component} from "react";

import {Link} from "react-router-dom";

import AppNavBar from "./components/AppNavBar";
import Routes from "./Routes";

class App extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <div className="App container">
                <AppNavBar />
                <Routes />
            </div>
        )
    }
}

export default App;
