import React, { Component } from 'react';

import './Form.css'

class Form extends Component {
  handleEmailChange(event) {
    this.setState({
      user: event.target.value
    })
  }
  handlePasswordChange(event) {
    this.setState({
      password: event.target.value
    })
  }
  handleFormSubmit(event) {
    event.preventDefault();
    this.props.onSubmit(this.state)
  }
  render() {
    return (
      <div className="Form">
        <form onSubmit={(event) => this.handleFormSubmit(event)} className="form-signin">
          <img className="mb-4" src="https://static.ah.nl/1.337.8/_ui/img/logo-ah.svg" alt="AH" width="72" height="72"/>
          <label htmlFor="inputEmail" className="sr-only">Email address</label>
          <input onChange={ (event) => this.handleEmailChange(event) } type="email" id="inputEmail" className="form-control" placeholder="Email address" required autoFocus/>
          <label htmlFor="inputPassword" className="sr-only">Password</label>
          <input onChange={ (event) => this.handlePasswordChange(event) } type="password" id="inputPassword" className="form-control" placeholder="Password" required/>
          <button className="btn btn-lg btn-primary btn-block" type="submit">Sign in</button>
          <br/><br/>
          <h4 className="text-secondary">OR</h4>
          <br/><br/>
          <button onClick={(event) => this.handleFormSubmit(event)} type="button" className="btn btn-lg btn-dark btn-block">Run anonymously</button>
        </form>
      </div>
    );
  }
}

export default Form;
