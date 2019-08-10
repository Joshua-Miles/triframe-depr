import React, { Component } from 'react';
import Selection from './Selection';
import { Text } from '..';

export default ({ document }) => {
    return (
        <Text>{document.title}</Text>
    )
}