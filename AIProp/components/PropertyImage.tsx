import React, { useState } from 'react';
import { Image, ImageProps, StyleSheet, View } from 'react-native';
import { Home } from 'lucide-react-native';

interface PropertyImageProps extends Omit\u003cImageProps, 'source'\u003e {
    uri?: string;
    style?: any;
}

export const PropertyImage: React.FC\u003cPropertyImageProps\u003e = ({ uri, style, ...props }) => {
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    if (!uri || error) {
        return (
\u003cView style = { [styles.fallbackContainer, style]}\u003e
\u003cHome size = { 48} color = "#9CA3AF" strokeWidth = { 1.5} /\u003e
\u003c / View\u003e
        );
    }

return (
\u003cImage
{...props }
source = {{ uri }}
style = { style }
onError = {() => setError(true)}
onLoadStart = {() => setLoading(true)}
onLoadEnd = {() => setLoading(false)}
        /\u003e
    );
};

const styles = StyleSheet.create({
    fallbackContainer: {
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
