import React from 'react';
import ReactDOM from 'react-dom';
import App from './containers/App';

const title = 'GoldFishes';

ReactDOM.render(
  <App title={title} />,
  document.getElementById('app'),
);
