import React, { Component } from 'react'

import axios from 'axios'
import Dropzone from 'react-dropzone'

import {Progress, Icon, Card} from 'antd'
import 'antd/dist/antd.css';

class FileUploader extends Component {

  state = {
    uploadProgress: 0,
    uploadSuccess: false,
    uploadFileName: ''
  } 

  async doSubmit(filesubmit){

    const {chunkSize, requestEndPoint } = this.props

    //console.log(chunkSize, requestEndPoint)
    //console.log(filesubmit)
    if(filesubmit.length >= 1){

    //todo 
    //grab the file list here and then run a loop 
    //in such a way that there is a dynamic setting of state for every file 
    // fileStatus : {fileuploadprogress, fileuploadsuccess, fileuploadfailure}
    // state is set for ; fileuploadprogress, fileuploadSuccess, fileuploadFailure
    //once that is done set the indivisual states and then 
    //go for a final loop down in render section 

        
        var file = filesubmit[0];
        var res = file.name.split(".");
        //console.log(file)
        //console.log("fileName and type", res)
                    
        var j = 1;
        var destinationDir = "resources"
        
        var fr = new FileReader(file)
        fr.readAsArrayBuffer(file)

        fr.onload = async (e) => {
                this.setState({uploadFileName: file.name}, ()=> {
                  //console.log(this.state.uploadFileName)
                })
                this.setState({uploadSuccess: false})
                var dataArray = new Uint8Array(fr.result);
                
                let totalparts = Math.ceil(dataArray.length/ (chunkSize*1024*1024))
                //console.log("no of chunks to be made", totalparts)
                let newpercentCompleted = 0
                let additionalCounter = 0
                
                for (var i = 0; i < dataArray.length; i += chunkSize*1024*1024) {
                        var blob = new Blob([dataArray.subarray(i, i + chunkSize*1024*1024)]);
                        var formData = new FormData();
                        //console.log("blob no; ",j, " uploading");
                        //console.log("blob ",blob);
                        
                        //console.log("the extension of filename",res[1]);
                        formData.set("file", blob , res[0]+"_" +j+"."+res[1]);

                        
                        let onUploadProgress = (progressEvent) => {
                                let percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total )
                                //console.log("percent before manip",percentCompleted)
                                newpercentCompleted = ((percentCompleted)*(1/totalparts))+additionalCounter
                                
                                this.setState({uploadProgress: newpercentCompleted}, ()=> {//console.log("after manip",this.state.uploadProgress)
                                                })
                                
                                //console.log(newpercentCompleted)
                                //console.log(percentCompleted)
                            }
                        
                        await axios({
                        method: 'post',
                        url: 'http://198.168.5.16:8080/upload',
                        data: formData,
                        params: {
                            tmpDir: res[0]
                        },
                        headers: {
                        'content-type': `multipart/form-data; boundary=${formData._boundary}`,
                        },
                        onUploadProgress

                    }).then(async (response) =>{
                        //console.log("chunk no ", j, "uploaded and response : " , response);
                        additionalCounter = this.state.uploadProgress
                        //this.setState({uploadSuccess: true})
                        //this.setState({uploadProgress: 0})
                    })
                    .catch(async (error) => {
                        console.log(error);
                    });

                    j =j+1;

                //let uploadProgress = ((j/totalparts)*100)
                //this.setState({uploadProgress})
                // set the state here so that for every loop there is a progress
                //and render it as previous method

                }
                const response=  await axios({
                    method: 'post',
                    url: requestEndPoint,
                    params: {
                        chunkSize: j-1,
                        tmpDir: res[0],
                        fileName: res[0],
                        extension: res[1],
                        destinationDir: destinationDir
                    }
                }).then(async (response) =>{
                    //console.log("response from combine ", response);
                    this.setState({uploadSuccess: true})
                    this.setState({uploadProgress : 0})
                })
                .catch(async (error) => {
                    console.log(error);
                });
            
        
            }
    };

  }

  
  render() {
    return (
            <div>
              <Dropzone onDrop={acceptedFiles => this.doSubmit(acceptedFiles)}>
                {({getRootProps, getInputProps}) => (
                <section style={{width:"506px", cursor: "pointer", border: "3px dashed #ccc"}}>
                  <div {...getRootProps()}>
                    <input {...getInputProps()} />

                      <Card
                      
                        title="Click or drag file to this area to upload"
                        bordered={false}
                        style={{ width: 500 , textAlign: "center" }}
                        >

                        <Icon type="cloud-upload"  style={{fontSize: "3.5rem"}}/>
                        
                        <p>
                        Support for a single file upload. Click and select a file manually from 
                        a location or drag the file and drop here. 
                        </p>

                      </Card>
                      {/* state calls for progress bar and success */}
                        {this.state.uploadProgress >0 && this.state.uploadProgress<=100 ? <Card><p>{this.state.uploadFileName} <Progress percent={Math.round(this.state.uploadProgress)} width={80} status="active" /> </p> </Card>: null }
                        {this.state.uploadSuccess? <Card><h3>Upload Complete </h3> </Card>: null}


                  </div>
                </section>
                )}
              </Dropzone>
            </div>
    )
  }
}


export default FileUploader