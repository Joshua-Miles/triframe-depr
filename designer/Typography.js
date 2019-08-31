import React from 'react';
import { Text, Title as Heading, Subheading, Paragraph, Caption } from 'react-native-paper'

const Title = ({ children }) => (
    <Heading style={{ fontSize: 40, marginTop: 10, marginBottom: 10 }}>
        {children}
    </Heading>
)

export {
    Text, 
    Paragraph,
    Caption,
    Title, Heading, Subheading,
}