import React, { Component } from 'react';
import Selection from './Selection';
import { Text } from 'react-native';

export default ({ document }) => {
    return (
        <Text>{document.title}</Text>
    )
}