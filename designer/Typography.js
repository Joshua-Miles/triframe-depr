import React from 'react';
import { Text, Title as Heading, Subheading, Paragraph, Caption } from 'react-native-paper'
const Title = ({ children }) => (
    <Text style={{ fontSize: 60, marginTop: 10 }}>
        {children}
    </Text>
)

export {
    Text, 
    Paragraph,
    Caption,
    Title, Heading, Subheading,
}