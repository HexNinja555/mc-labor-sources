import { useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Image,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Card,
  DetailRow,
  ErrorBanner,
  ImageBanner,
  Screen,
  SectionTitle,
  StackAppHeader,
  SummaryBar,
  screenLayout,
  SuccessBanner,
} from '@/components/ui';
import { SignaturePad } from '@/components/SignaturePad';
import { FF, fonts, statusColors } from '@/theme/brand';
import { IMAGERY } from '@/constants/imagery';
import { mobileApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function SupervisorTimesheetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [item, setItem] = useState<Awaited<ReturnType<typeof mobileApi.getSupervisorTimesheet>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [signing, setSigning] = useState(false);
  const [showSignPad, setShowSignPad] = useState(false);
  const [foremanName, setForemanName] = useState('');
  const [foremanEmail, setForemanEmail] = useState('');
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!id) return;
    mobileApi
      .getSupervisorTimesheet(id)
      .then((ts) => {
        setItem(ts);
        setForemanName(user?.name ?? '');
        setForemanEmail(user?.email ?? '');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id, user?.email, user?.name]);

  const canSign = item && (item.status === 'DRAFT' || item.status === 'SUBMITTED') && !item.signature;

  async function handleSign() {
    if (!item || !signatureDataUrl || !foremanName.trim()) {
      setError('Enter foreman name and capture your signature.');
      return;
    }
    setSigning(true);
    setError('');
    try {
      const updated = await mobileApi.signSupervisorTimesheet(item.id, {
        foremanName: foremanName.trim(),
        foremanEmail: foremanEmail.trim() || undefined,
        signatureDataUrl,
      });
      setItem(updated);
      setShowSignPad(false);
      setSuccess('Timesheet signed successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign timesheet');
    } finally {
      setSigning(false);
    }
  }

  if (loading) {
    return (
      <Screen padded={false}>
        <StackAppHeader />
        <ImageBanner variant="full" source={IMAGERY.heroTimesheets} title="Timesheet" subtitle="Loading…" />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={FF.primary} />
        </View>
      </Screen>
    );
  }

  if (error && !item) {
    return (
      <Screen padded={false}>
        <StackAppHeader />
        <ImageBanner variant="full" source={IMAGERY.heroTimesheets} title="Timesheet" />
        <View style={screenLayout.body}>
          <ErrorBanner message={error} />
        </View>
      </Screen>
    );
  }

  if (!item) {
    return (
      <Screen padded={false}>
        <StackAppHeader />
        <ImageBanner variant="full" source={IMAGERY.heroTimesheets} title="Timesheet" />
        <View style={screenLayout.body}>
          <ErrorBanner message="Timesheet not found" />
        </View>
      </Screen>
    );
  }

  const badge = statusColors(item.status);
  const employeeName = item.employee
    ? `${item.employee.firstName} ${item.employee.lastName}`
    : 'Employee';
  const periodLabel =
    item.weekStartDate && item.weekEndDate
      ? `${item.weekStartDate} – ${item.weekEndDate}`
      : item.workDate ?? '—';

  return (
    <Screen padded={false}>
      <StackAppHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={screenLayout.listContent}
        showsVerticalScrollIndicator={false}
      >
        <ImageBanner
          variant="full"
          source={IMAGERY.heroTimesheets}
          title={employeeName}
          subtitle={`${item.totalHours}h · ${item.jobSite?.name ?? 'Job site'}`}
        />

        <View style={screenLayout.body}>
          {success ? <SuccessBanner message={success} /> : null}
          {error ? <ErrorBanner message={error} /> : null}

          <SummaryBar status={item.status} statusColors={badge} meta={periodLabel} />

          <SectionTitle>Summary</SectionTitle>
          <Card style={styles.detailsCard}>
            <DetailRow icon="business-outline" label="Job site" value={item.jobSite?.name} />
            <DetailRow icon="time-outline" label="Total hours" value={`${item.totalHours}h`} />
            <DetailRow icon="calendar-outline" label="Period" value={periodLabel} />
          </Card>

          {item.entries && item.entries.length > 0 && (
            <>
              <SectionTitle>Time entries</SectionTitle>
              <Card>
                {item.entries.map((entry, index) => (
                  <View key={entry.id} style={[styles.entryRow, index > 0 && styles.entryBorder]}>
                    <Text style={styles.entryDate}>{entry.workDate}</Text>
                    <Text style={styles.entryTime}>
                      {entry.startTime} – {entry.endTime}
                    </Text>
                    <Text style={styles.entryHours}>{entry.hours}h</Text>
                  </View>
                ))}
              </Card>
            </>
          )}

          {item.signature?.signatureImageUrl ? (
            <>
              <SectionTitle>Signature</SectionTitle>
              <Card>
                <DetailRow icon="person-outline" label="Foreman" value={item.signature.foremanName} />
                <Image
                  source={{ uri: item.signature.signatureImageUrl }}
                  style={styles.signatureImage}
                  resizeMode="contain"
                />
              </Card>
            </>
          ) : null}

          {canSign && !showSignPad ? (
            <Pressable style={styles.signBtn} onPress={() => setShowSignPad(true)}>
              <Text style={styles.signBtnText}>Sign timesheet</Text>
            </Pressable>
          ) : null}

          {canSign && showSignPad ? (
            <>
              <SectionTitle>Foreman sign-off</SectionTitle>
              <Card style={styles.signCard}>
                <Text style={styles.fieldLabel}>Foreman name</Text>
                <TextInput
                  style={styles.input}
                  value={foremanName}
                  onChangeText={setForemanName}
                  placeholder="Your name"
                  placeholderTextColor={FF.textMuted}
                />
                <Text style={styles.fieldLabel}>Foreman email</Text>
                <TextInput
                  style={styles.input}
                  value={foremanEmail}
                  onChangeText={setForemanEmail}
                  placeholder="Email (optional)"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor={FF.textMuted}
                />
                <SignaturePad
                  onSignature={(dataUrl) => {
                    setSignatureDataUrl(dataUrl);
                    setError('');
                  }}
                  onError={(msg) => setError(msg)}
                />
                {signatureDataUrl ? (
                  <Text style={styles.captured}>Signature captured — tap Sign to submit.</Text>
                ) : null}
                <View style={styles.signActions}>
                  <Pressable style={styles.cancelBtn} onPress={() => setShowSignPad(false)} disabled={signing}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.submitBtn, signing && styles.submitDisabled]}
                    onPress={handleSign}
                    disabled={signing}
                  >
                    {signing ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.submitText}>Sign & submit</Text>
                    )}
                  </Pressable>
                </View>
              </Card>
            </>
          ) : null}

          {success ? (
            <Pressable style={styles.backBtn} onPress={() => router.back()}>
              <Text style={styles.backBtnText}>Back to list</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  detailsCard: { paddingVertical: 4, marginBottom: 8 },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: 8,
  },
  entryBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: FF.border,
  },
  entryDate: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: FF.text,
  },
  entryTime: {
    flex: 1.2,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: FF.textSecondary,
  },
  entryHours: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: FF.primary,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  signatureImage: {
    width: '100%',
    height: 120,
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: FF.bg,
  },
  signBtn: {
    marginTop: 16,
    backgroundColor: FF.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: '#fff',
  },
  signCard: {
    gap: 8,
  },
  fieldLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: FF.textSecondary,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: FF.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: FF.text,
    backgroundColor: '#fff',
  },
  captured: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: '#15803d',
    marginTop: 4,
  },
  signActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: FF.border,
  },
  cancelText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: FF.textSecondary,
  },
  submitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: FF.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: '#fff',
  },
  backBtn: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  backBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: FF.primary,
  },
});
