import React from 'react';

import { Switch, Route } from "react-router-dom";
import ProductEdit from './edit';
import ProductGrid from './grid';

function Product(){
  return (
    <Switch>
      <Route path="/product/edit/:productId" component={ProductEdit}/>
      <Route component={ProductGrid}/>
    </Switch>

  )

}

export default Product;