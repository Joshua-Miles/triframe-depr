import React, { useState } from 'react';
import { Button as Pressable, FAB, ToggleButton } from 'react-native-paper'
import { View } from 'react-native'

const Button = ({ children, mode = "contained", ...rest }) => (
    <View style={{ flexDirection: 'row' }}>
        <Pressable style={{ padding: 5, margin: 5 }} mode={mode} {...rest}>{children}</Pressable>
    </View>
)

const BubbleButton = (props) => (
    <FAB
        style={{
            margin: 16,
            width: props.small ? 40 : 56
        }}
        {...props}
    />
)

export {
    Button, BubbleButton, ToggleButton
}
