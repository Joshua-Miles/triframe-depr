import React, { useEffect } from 'react';
import { ScrollView } from 'react-native'
import DrawerLayout from 'react-native-drawer-layout';
import { View } from '.'

export default ({ children, open, render = () => null, onClose }) => {
    let drawer;

    useEffect(() => {
        if(open) drawer.openDrawer()
        else drawer.closeDrawer()
    }, [ open ])

    const closeDrawer = () => drawer.closeDrawer()
    return (
        <DrawerLayout
            onDrawerClose={onClose}
            drawerWidth={300}
            drawerLockMode={'unlocked'}
            keyboardDismissMode="on-drag"
            ref={ x => drawer = x }
            renderNavigationView={() => render({ closeDrawer })}>
            <View style={{ height: '100vh' }}>
                <ScrollView>
                    {children}
                </ScrollView>
            </View>
        </DrawerLayout>
    )
}