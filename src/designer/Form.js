import React, { useState, useMemo } from 'react';
import { TextInput as TextField, View, TouchableOpacity, Text } from 'react-native'
import { TextInput as RNPTextInput, HelperText, Switch, Subheading } from 'react-native-paper'
import { Area } from './Layout'
import { FileInput } from './FileInput'
import { DateTimeInput } from './DateTimeInput'
import { TextArea } from './TextArea'

const TextInput = ({ onChange, onChangeText, ...props }) => (
  <RNPTextInput  onChangeText={onChange || onChangeText} {...props} />
)

const PasswordInput = (props) => (
  <TextInput secureTextEntry={true} {...props} />
)

const ToggleInput = ({ label, onChange, value, ...props }) => (
  <Area>
    <Subheading>{label}</Subheading>
    <Area alignX="left">
      <Switch onValueChange={onChange} value={value} {...props} />
    </Area>
  </Area>
)

const ToggleSwitch = ({ onPress, ...props }) => (
  <Switch onValueChange={onPress} {...props} />
)

export { TextField, TextInput, PasswordInput, ToggleInput, FileInput, DateTimeInput, HelperText, ToggleSwitch, TextArea }