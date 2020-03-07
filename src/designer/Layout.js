import React, { useState, useEffect } from 'react';
import { Dimensions, View, ScrollView, Text } from "react-native";
import { Portal } from 'react-native-paper'


export const Container = ({ children, style, slim }) => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{
        flexGrow: 1, display: 'flex', margin: slim ? 0 : 50, ...style,
    }}>
        <View><Portal.Host /></View>
        {renderChildren(children)}
    </ScrollView>
)

export const Section = ({ children, inline, style }) => (
    <View style={{
        marginTop: 15,
        marginBottom: 15,
        ...style
    }}>
        {renderChildren(children)}
    </View>
)

const alignment = {
    x: {
        left: { marginRight: 'auto' },
        right: { marginLeft: 'auto' },
        center: { marginRight: 'auto', marginLeft: 'auto'} 
    },
    y: {
        top: { marginBottom: 'auto' },
        bottom: { marginTop: 'auto' },
        center: { marginTop: 'auto', marginBottom: 'auto'} 
    },
    [null]: {}
}

export const Area = ({ children, inline = false, alignX = null, alignY = null, flex = false, style = {} }) => (
    <View style={{
        flex: flex ? 1 : undefined,
        flexDirection: inline ? 'row' : undefined,
        ...alignment.x[alignX],
        ...alignment.y[alignY],
        ...style,
    }}>
        {renderChildren(children)}
    </View>
)

export const createGrid = sizes => {

    const GridContext = React.createContext({ base: 12 });

    const Grid = ({ children, base = 12, gutter = 0.5 }) => (
        <View style={{ flex: 1, flexDirection: 'row', flexWrap: "wrap", display: "flex", height: `100%` }} >
            <GridContext.Provider value={{ base, gutter }}>
                {renderChildren(children)}
            </GridContext.Provider>
        </View>
    )

    const Column = (props) => (
        <GridContext.Consumer>
            {context => <Cell props={props} context={context} />}
        </GridContext.Consumer>
    )

    const Cell = ({ context, props }) => {

        const { base, gutter } = context

        const { width, height } = useScreenSize(props)

        let size = 1
        for (let currentSize in sizes) {
            let threshold = sizes[currentSize]
            if (props[currentSize] && (!size || width > threshold)) {
                size = props[currentSize];
            }
        }

        let styles;
        switch (size) {
            case 'fix-bottom':
                styles = {
                    position: 'absolute',
                    width: '100%',
                    top: height * (2 / 3),
                    height: height / 3
                }
                break;
            default:
                const width = 100 / base * size - (gutter * 2);
                styles = {
                    margin: `${gutter}%`,
                    flex: props.justify ? 1 : null,
                    width: `${width}%`,
                    height: '100%'
                }
                break;
        }


        return (
            <View style={styles} >
                {renderChildren(props.children)}
            </View>
        )
    }

    return { Grid, Column }

}


const useScreenSize = (props) => {
    let window = Dimensions.get('window');
    const [sizes, updateSizes] = useState({
        width: window.width,
        height: window.height
    })

    useEffect(() => {
        Dimensions.addEventListener('change', ({ window }) => {
            updateSizes({
                width: window.width,
                height: window.height
            })
        })
    }, [])

    return sizes
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

