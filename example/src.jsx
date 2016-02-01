import React from 'react';
import ReactDOM from 'react-dom';

import TextButton from '../src';
document.addEventListener('DOMContentLoaded', function() {
  ReactDOM.render(<TextButton touchUpInside={function(){alert("RIGHT!")}}>Button</TextButton>, document.querySelector('#button'));
});
