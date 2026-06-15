import { View, Text, ScrollView, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { BrandHeaderBar } from '@/components/BrandHeaderBar';
import { brandStyles } from '@/theme/brand';

const MENU = [
  { href: '/assignments', label: 'My Assignments' },
  { href: '/assignments/1', label: 'Assignment Detail' },
  { href: '/clock', label: 'Clock In / Out' },
  { href: '/job-orders', label: 'Job Orders' },
  { href: '/safety-bulletins', label: 'Safety Bulletins' },
  { href: '/timesheets', label: 'Timesheets' },
  { href: '/timesheet-signature', label: 'Foreman Signature' },
];

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <BrandHeaderBar />
      <View style={styles.content}>
        <Text style={styles.heading}>Welcome, Worker</Text>
        <Text style={styles.sub}>MC Labor Sources Mobile — Milestone 2 Foundation</Text>
        {MENU.map((item) => (
          <Link key={item.href} href={item.href as never} asChild>
            <Pressable style={styles.card}>
              <Text style={styles.cardText}>{item.label}</Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = {
  container: brandStyles.screenMuted,
  content: { padding: 16 },
  heading: {
    ...brandStyles.heading,
    marginBottom: 4,
  },
  sub: {
    ...brandStyles.note,
    marginBottom: 20,
    marginTop: 0,
  },
  card: brandStyles.card,
  cardText: brandStyles.cardText,
};
