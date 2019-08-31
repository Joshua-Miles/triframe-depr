import React, { useState, useEffect } from 'react';
import { Dimensions, View, StyleSheet } from "react-native";
import { each } from "../mason";
export const createGrid = sizes => {

    const GridContext = React.createContext({ base: 12 });

    const Grid = ({ children, base = 12, gutter = 0.5 }) => (
       <View style={{flex: 1, flexDirection: 'row', flexWrap: "wrap", display: "flex", height: `100%`}} >
           <GridContext.Provider value={{ base, gutter }}>
                {children}
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

        const { right, inline } = props

        let size;
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
                    width: `${width}%`
                }
            break;
        }

        if(inline){
            styles.flexDirection='row'
        }

        if(right){
            if(inline) styles.justifyContent= 'flex-end'
            else styles.alignItems = 'flex-end'
        }

        return (
            <View style={styles} >
                {props.children}
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

const stylesheet = StyleSheet.create({
    inline: {
        flexDirection: 'row'
    }
})