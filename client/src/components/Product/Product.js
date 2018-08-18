import React, { Component } from 'react';

import './Product.css'

class Product extends Component {
  render() {
    let image = this.props.product.image;
    if (!image) {
      image = 'data:image/png;base64,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';
    }
    let badge = '';
    if (this.props.product.discount) {
      badge = <span class="badge badge-primary float-right">{this.props.product.discount}</span>
    }
    let newPrice = '';
    if (this.props.product.newPrice) {
      newPrice = <span><br/><p class="text-primary float-right">€{this.props.product.newPrice}</p></span>
    }
    return (
      <div className="Product">
        <a className="product-link-card" href={this.props.product.link} target="_blank" rel="noopener,nofollow">
          <div className="card">
            <img className="card-img-top" src={image} alt="Product"/>
            <div className="card-body">
              <h5 className="card-title">{this.props.product.name}</h5>
              {badge}
              {newPrice}
            </div>
          </div>
        </a>
      </div>
    );
  }
}

export default Product;
