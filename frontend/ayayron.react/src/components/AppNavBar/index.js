import React, {Component} from "react";
import "./index.css";

import {Navbar} from "react-bootstrap";
import {Link} from "react-router-dom";

import 'bootstrap/dist/css/bootstrap.min.css';

class AppNavBar extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <div class="AppNavBar">
                <Navbar fluid collapseOnSelect>
                    <Navbar.Brand>
                        <Link to="/">Ayayron</Link>
                    </Navbar.Brand>
                    <Navbar.Toggle />
                </Navbar>
            </div>
        );
    }
}

export default AppNavBar;
