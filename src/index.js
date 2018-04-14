import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import FrontEnd from './FrontEnd'


const publishedWords = ['balance', 'life', 'crystal', 'river'];
const submittedWords = [{ word: 'shit', width: 5 },
						{ word: 'love', width: 75 },
						{ word: 'balls', width: 25 },
						{ word: 'criminal', width: 45 },
						{ word: 'vitalik', width: 65 },
						{ word: 'hodl', width: 42 },
						{ word: 'hate', width: 5 },
						{ word: 'stop', width: 25 }];

ReactDOM.render(
  // <App name="Travis">Hello!</App>,
  <FrontEnd publishedWords={publishedWords} submittedWords={submittedWords}></FrontEnd>,
  document.getElementById('root')
);
