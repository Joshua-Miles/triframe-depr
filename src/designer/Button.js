import React, { useState } from 'react';
import { Button as Pressable, FAB, ToggleButton, withTheme, ActivityIndicator } from 'react-native-paper'
import { View } from 'react-native'

const Button = withTheme(({ children, mode = "contained", disabled = false, disableWhileProcessing= true, processingMessage= null, icon, onPress, theme, color, ...rest }) => {
    let handlePress;
    let [ processing, setProcessing ] = useState(false)
    if(typeof onPress === 'function') handlePress = function(e){
        let process = onPress(e)
        if(disableWhileProcessing && process && typeof process.then == 'function'){ 
            setProcessing(true)
            process.then(() => {
                setProcessing(false)
            })
        }
    }
    return (
        <Pressable 
            style={{ padding: 5, margin: 5 }} 
            disabled={disabled || processing}
            mode={mode} color={theme.colors[color] || color } 
            icon={ processing ? props => <ActivityIndicator animating={true}  {...props} /> : icon}
            onPress={handlePress}
            {...rest}
        >
            { processing 
                ? processingMessage || children
                : children
            }
        </Pressable>
    )
})

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
