import React from 'react'
import { Card, Chip as RNPChip, List } from 'react-native-paper'
import { View } from 'react-native'

const Chip = ({ children, ...props}) => (
    <View style={{ flexDirection: 'row' }}>
        <RNPChip {...props}>{children}</RNPChip>
    </View>
)

export { Card, Chip, List }