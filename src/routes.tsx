import React from 'react'
import {Route,BrowserRouter, Router} from 'react-router-dom'

import Home from './pages/Home'
import CreatePointer from './pages/CreatePoint'

const Routes = () =>{
  return(
    <BrowserRouter>
      <Route component={Home} path="/" exact/>
      <Route component={CreatePointer} path="/create-pointer" exact/>
    </BrowserRouter>
  );
}

export default Routes;