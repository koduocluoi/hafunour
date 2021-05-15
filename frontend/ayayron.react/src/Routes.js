import React from "react";
import { Route, Switch } from "react-router-dom";
import Homepage from "./containers/Homepage";

export default function Routes() {
    return (
        <Switch>
            <Route path="/" exact component={Homepage} />
        </Switch>
    );
}
