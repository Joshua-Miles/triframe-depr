import React, { useEffect } from 'react';
import DrawerLayout from 'react-native-drawer-layout';

export default ({ children, open, render = () => null, onClose }) => {
    let drawer;

    useEffect(() => {
        if(open) drawer.openDrawer()
        else drawer.closeDrawer()
    }, [ open ])

    return (
        <DrawerLayout
            onDrawerClose={onClose}
            drawerWidth={300}
            drawerLockMode={'unlocked'}
            keyboardDismissMode="on-drag"
            ref={ x => drawer = x }
            renderNavigationView={() => render({ closeDrawer: onClose })}>
            {children}
        </DrawerLayout>
    )
}