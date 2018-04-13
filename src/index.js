import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import FrontEnd from './FrontEnd'


const publishedWords = ['balance', 'life', 'crystal', 'river'];

ReactDOM.render(
  // <App name="Travis">Hello!</App>,
  <FrontEnd publishedWords={publishedWords}></FrontEnd>,
  document.getElementById('root')
);
