// AboutScreen.js
// Lets users know what the app and ADPC is about. Contains no interaction elements, only Text.
import React, { useContext } from 'react';
import { View, Text, ScrollView, SafeAreaView, Image } from 'react-native';
import ThemeContext from '../ThemeContext';
import { StyleSheet } from 'react-native';
import Logo from '../assets/adpc_logo_high.png';

const AboutScreen = () => {
    const { theme } = useContext(ThemeContext);

    // The component returns a layout wrapped in a SafeAreaView and ScrollView for scrolling content.
    return (
      <SafeAreaView style={[styles.topContainer, { backgroundColor: theme.backgroundColor }]}>
        <ScrollView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
          <View style={styles.logoContainer}>
        <Image source={Logo} style={styles.logo} />
        </View>
            <Text style={[styles.title, { color: theme.textColor }]}>Advanced Data Protection Control (ADPC)</Text>
                <Text style={[styles.paragraph, {color: theme.textColor}]}>
                  ADPC is a proposed automated mechanism for the communication of users’ privacy decisions.
                  It aims to empower users to protect their online choices in a human-centric, easy, and enforceable manner.
                  ADPC also supports online publishers and service providers to comply with data protection and consumer protection regulations.
                </Text>

                <Text style={[styles.subTitle, { color: theme.textColor }]}>Why ADPC?</Text>
                <Text style={[styles.paragraph, { color: theme.textColor}]}>
                  Reducing friction
                  Replacing outdated banners
                  You hate “cookie banners” too? ADPC would allow users to set their privacy preferences in their browser, plugin, or operating system and communicate them in a simple way – limiting friction in user interaction for providers and users alike, as foreseen or planned in various innovative laws.
                </Text>

                <Text style={[styles.subTitle, { color: theme.textColor }]}>How can it help you?</Text>
                <Text style={[styles.paragraph, { color: theme.textColor }]}>
                  Are you tired of clicking cookie banners? ADPC enables you to automatically communicate your privacy preferences to websites.
                  You can manage your privacy choices on your device, e.g., in your browser or operating system.
                  Default settings can be set to communicate your choices without having your online experience interrupted, or you can set rules that determine when consent requests should be presented to you.
                  All your decisions will be accessible through a central interface that you can edit when you want.
                </Text>

                <Text style={[styles.subTitle, { color: theme.textColor }]}>Copyright</Text>
                <Text style={[styles.paragraph, { color: theme.textColor }]}>
                © Sustainable Computing Lab 2024
                </Text>
        </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
},
  subTitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
  },
  paragraph: {
    fontSize: 14,
    marginBottom: 20,
  },
  topContainer: {
    flex: 1,

  },
  logo: {
    width: 223,
    height: 100,
    marginBottom: 20,
  },
  logoContainer:{
    alignItems: 'center'
  },
})

export default AboutScreen;