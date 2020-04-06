import React, { useState } from 'react'
import { Button } from '../Button'
import { HelperText } from 'react-native-paper'
import { Model } from '../Provider'
import * as ImagePicker from 'expo-image-picker';


export const FileInput = ({ onChange = () => void (0), multiple = false, path = false, children = 'Upload', ...props }) => {
    const [ filenames, changeFilenames ] = useState('')
    let openImagePickerAsync = async (url) => {
      let permissionResult = await ImagePicker.requestCameraRollPermissionsAsync();
  
      if (permissionResult.granted === false) {
        alert("Permission to access camera roll is required!");
        return;
      }
  
      let result = await ImagePicker.launchImageLibraryAsync({
        base64: false
      });
  
      if (!result.cancelled) {
        // ImagePicker saves the taken photo to disk and returns a local URI to it
        let localUri = result.uri;
        let filename = localUri.split('/').pop();
  
        changeFilenames(filename)
  
        // Infer the type of the image
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;
  
        // Upload the image using the fetch and FormData APIs
        let formData = new FormData();
        // Assume "photo" is the name of the form field the server expects
        formData.append(0, { uri: localUri, name: filename, type });
  
        fetch(`${url}/upload`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formData
        })
          .then(res => res.json())
          .then(urls => {
            onChange(multiple ? urls : urls[0])
          })
      }
    }
  
    return (
      <Model.Consumer>
        {models =>
          <>
            <Button onPress={() => openImagePickerAsync(models.url)} {...props}>{children}</Button>
            <HelperText>{filenames}</HelperText>
          </>
        }
      </Model.Consumer>
    );
  }
  