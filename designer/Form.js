import React from 'react';

import { TextInput as TextField } from 'react-native'
import { TextInput, HelperText, Switch } from 'react-native-paper'


const ToggleSwitch = ({ onPress, ...props}) => (
    <Switch onValueChange={onPress} {...props} />
)


export { TextField, TextInput, HelperText, ToggleSwitch }