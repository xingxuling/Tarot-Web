import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useColorScheme, Pressable, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../../src/contexts/language-context';
import Colors from '../../constants/Colors';
import { theme, colors } from '../../src/theme';

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={styles.icon} {...props} />;
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primaryDark,
  },
  icon: {
    marginBottom: -3,
  },
  languageButton: {
    marginRight: theme.spacing.md,
  },
  languageText: {
    color: colors.white,
  },
  tabBar: {
    backgroundColor: colors.primaryDark,
  },
});

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t, language, setLanguage } = useLanguage();

  return (
    <Tabs
      initialRouteName="tarot-reading"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarStyle: styles.tabBar,
        headerStyle: styles.header,
        headerTintColor: colors.white,
        headerRight: () => (
          <Pressable
            onPress={() => setLanguage(language === 'en' ? 'zh' : 'en')}
            style={({ pressed }) => [
              styles.languageButton,
              { opacity: pressed ? 0.5 : 1 }
            ]}
          >
            <Text style={styles.languageText}>{language === 'en' ? '中文' : 'EN'}</Text>
          </Pressable>
        ),
      }}>
      <Tabs.Screen
        name="tarot-reading"
        options={{
          title: t('tabs.tarot_reading'),
          tabBarIcon: ({ color }) => <TabBarIcon name="magic" color={color} />,
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          title: t('tabs.store'),
          tabBarIcon: ({ color }) => <TabBarIcon name="shopping-cart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
