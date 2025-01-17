import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useColorScheme, Pressable, Text } from 'react-native';
import { useLanguage } from '../../src/contexts/language-context';
import Colors from '../../constants/Colors';

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t, language, setLanguage } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarStyle: {
          backgroundColor: '#1e1b4b',
        },
        headerStyle: {
          backgroundColor: '#1e1b4b',
        },
        headerTintColor: '#fff',
        headerRight: () => (
          <Pressable
            onPress={() => setLanguage(language === 'en' ? 'zh' : 'en')}
            style={({ pressed }) => ({
              opacity: pressed ? 0.5 : 1,
              marginRight: 15,
            })}
          >
            <Text style={{ color: '#fff' }}>{language === 'en' ? '中文' : 'EN'}</Text>
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
