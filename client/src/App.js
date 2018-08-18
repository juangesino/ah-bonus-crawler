import React, { Component } from 'react';

import Product from './components/Product/Product';
import Form from './components/Form/Form';
import Loading from './components/Loading/Loading';

class App extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      products: false
    }
  }
  componentDidMount() {
    // this.fetchProducts()
  }
  handleOnSubmit(auth) {
    if (auth) {
      this.setState({
        loading: true,
        user: auth.user,
        password: auth.password
      }, () => {
        this.fetchProducts()
      })
    } else {
      this.setState({
        loading: true
      }, () => {
        this.fetchProducts()
      })
    }
  }
  fetchProducts = async () => {
    let options = {};
    if (this.state.user && this.state.password) {
      options = {
        headers: {
            'Authorization': 'Basic ' + btoa(this.state.user + ':' + this.state.password),
        },
      }
    }
    const response = await fetch(`/api/products/bonus`, options)
    const results = await response.json()
    this.setState({
      loading: false,
      products: results.products
    })
  }
  render() {
    if (this.state.loading) {
      return(
        <div className="App">
          <Loading message="Crawling Albert Heijn's site."/>
        </div>
      )
    } else if (this.state.products) {
      let products = this.state.products;
      let productsHtml = products.map( (product, index) => (
        <div className="col-3 mt-2 mb-2" key={index}>
          <Product product={product} />
        </div>
      ))
      return (
        <div className="App">
          <div className="container mt-4 mb-3">
            <div className="row">
              <div className="col-12">
                <img src="https://static.ah.nl/1.337.8/_ui/img/logo-ah.svg" alt="AH" width="50"/> <h3 className="d-inline ml-2">Products on bonus:</h3>
                <hr/>
              </div>
            </div>
            <div className="row">
              {productsHtml}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="App">
          <Form onSubmit={(auth) => this.handleOnSubmit(auth)} />
        </div>
      );
    }
  }
}

export default App;
