import React from 'react'
import { Card, Chip as RNPChip, Surface as RNPSurface, List } from 'react-native-paper'
import { View } from 'react-native'
import { Area } from './Layout'

const Chip = ({ children, ...props}) => (
    <View style={{ flexDirection: 'row' }}>
        <RNPChip {...props}>{children}</RNPChip>
    </View>
)

const Surface = ({ children, elevation = 4, padding = 30, style= {}, ...props}) => {
    const { padding: surfacePadding, ...areaStyles } = style

    return (
        <Area {...props} style={areaStyles} >
            <RNPSurface elevation={elevation} style={{ padding: surfacePadding || padding }} >
                {renderChildren(children)}
            </RNPSurface>
        </Area>
        )
}

let renderChildren = children => (
    children && typeof children.map == 'function'
        ? children.map(renderChildren)
        : (
            typeof children === 'string'
                ? <Text>{children}</Text>
                : children
        )
)

export { Card, Chip, List, Surface }