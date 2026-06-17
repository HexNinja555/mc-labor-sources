import { View, Text, Pressable, Platform, StyleSheet } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FF, fonts, tabBarShadow } from '@/theme/brand';

function tabLabel(
  label: BottomTabBarProps['descriptors'][string]['options']['tabBarLabel'],
  title: string | undefined,
  routeName: string,
): string {
  if (typeof label === 'string') return label;
  if (typeof title === 'string' && title.length > 0) return title;
  const names: Record<string, string> = {
    index: 'Home',
    assignments: 'Assignments',
    clock: 'Clock',
    profile: 'Profile',
  };
  return names[routeName] ?? routeName;
}

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const paddingBottom = Platform.OS === 'web' ? 10 : Math.max(insets.bottom, 8);

  return (
    <View style={[styles.bar, { paddingBottom }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const color = isFocused ? FF.primary : FF.textMuted;
        const label = tabLabel(options.tabBarLabel, options.title, route.name);

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={({ pressed }) => [
              styles.tab,
              isFocused && styles.tabActive,
              pressed && styles.tabPressed,
            ]}
          >
            {options.tabBarIcon?.({ focused: isFocused, color, size: 22 })}
            <Text style={[styles.label, { color }]} numberOfLines={1}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: FF.card,
    borderTopWidth: 1,
    borderTopColor: FF.borderInput,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingHorizontal: 8,
    ...tabBarShadow,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 4,
    minHeight: 52,
    borderRadius: 14,
    marginHorizontal: 2,
  },
  tabActive: {
    backgroundColor: FF.blue50,
  },
  tabPressed: {
    opacity: 0.85,
  },
  label: {
    fontFamily: Platform.select({ web: 'Montserrat_600SemiBold, system-ui, sans-serif', default: fonts.semiBold }),
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
  },
});
