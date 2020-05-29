import React, { Component } from 'react'
import FileUploader from './FileUploader/FileUploader'

class App extends Component {
  render() {
    return (
      <div>
        <FileUploader
          chunkSize = '100'
          requestEndPoint = "http://198.168.5.16:8080/upload"
         />
      </div>
    )
  }
}


export default App