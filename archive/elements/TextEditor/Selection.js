import React, { Component } from 'react';
import { View } from 'react-native'

export default ({ height, width, color :backgroundColor, x :left, y :top }) => (
    <div style={{
        position: 'absolute',
        left, 
        top,
        height,
        width,
        backgroundColor,
        pointerEvents: 'none'
    }} />
)