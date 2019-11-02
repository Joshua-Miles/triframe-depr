import React, { useState, useEffect } from 'react';
import { Dimensions, View, ScrollView } from "react-native";
import { each } from "triframe/mason";
import { Text } from '.'


export const Container = ({ children, style, slim }) => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{
        flexGrow: 1, display: 'flex', margin: slim ? 0 : 50, ...style, 
    }}>
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

export const Area = ({ children, inline= false, alignX = 'left', alignY = 'left', style }) => (
    <View style={{
        justifyContent: inline ? alignmentMap[alignX] :  alignmentMap[alignY],
        alignItems:  inline ? alignmentMap[alignY] : alignmentMap[alignX],
        flexDirection: inline ? 'row' : 'column',
        flex: 1,
        ...style
    }}>
        {renderChildren(children)}
    </View>
)

export const createGrid = sizes => {

    const GridContext = React.createContext({ base: 12 });

    const Grid = ({ children, base = 12, gutter = 0.5 }) => (
       <View style={{flex: 1, flexDirection: 'row', flexWrap: "wrap", display: "flex", height: `100%`}} >
           <GridContext.Provider value={{ base, gutter }}>
                {renderChildren(children)}
           </GridContext.Provider>
       </View> 
    )
    
    const Column = (props) => (
        <GridContext.Consumer>
            { context => <Cell  props={props} context={context} /> }
        </GridContext.Consumer>
    )

    const Cell = ({ context, props }) => {
       
        const { base, gutter } = context
    
        const { width, height } = useScreenSize(props)

        let size = 1
        each(sizes, ( currentSize, threshold) => {
            if(props[currentSize] && ( !size || width > threshold ) ){
                size = props[currentSize];
            }
        })

        let styles;
        switch(size){
            case 'fix-bottom':
                styles = {
                    position: 'absolute',
                    width: '100%',
                    top: height * (2/ 3),
                    height: height / 3
                }
            break;
            default:
                const width = 100 / base * size - (gutter *  2);
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
    const [ sizes, updateSizes ] = useState({
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

const alignmentMap = {
    left: 'flex-start',
    right: 'flex-end',
    top: 'flex-start',
    bottom: 'flex-end',
    center: 'center',
    justify: 'space-between'
}