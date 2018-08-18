import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

class Loading extends Component {
  render() {
    return (
      <div className="Loading">
        <div className="container-fliud mt-5 mb-4 text-center">
          <div className="row row-error align-items-center">
            <div className="col-12">
              <FontAwesomeIcon icon={faCircleNotch} size="4x" className="text-primary" spin />
              <br/><br/>
              <h2>Loading...</h2>
              <small>{this.props.message}</small>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Loading;
