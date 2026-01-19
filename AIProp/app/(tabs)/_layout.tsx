import { Tabs } from "expo-router";
import { Home, Search, PlusCircle, Heart, User } from "lucide-react-native";
import React from "react";
import { Platform } from "react-native";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: "#8B5CF6",
                tabBarInactiveTintColor: "#9CA3AF",
                headerShown: false,
                tabBarStyle: {
                    position: "absolute",
                    backgroundColor: "#FFFFFF",
                    borderTopWidth: 0,
                    height: Platform.OS === "ios" ? 85 : 70,
                    paddingBottom: Platform.OS === "ios" ? 20 : 12,
                    paddingTop: 12,
                    marginHorizontal: 20,
                    marginBottom: Platform.OS === "ios" ? 20 : 16,
                    borderRadius: 24,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.15,
                    shadowRadius: 20,
                    elevation: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "600",
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    title: "Search",
                    tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="post"
                options={{
                    title: "Post Ad",
                    tabBarIcon: ({ color, size }) => <PlusCircle color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="saved"
                options={{
                    title: "Saved",
                    tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
                }}
            />
        </Tabs>
    );
}
