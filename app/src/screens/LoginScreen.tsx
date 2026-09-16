import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type LayoutChangeEvent,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { CircleAlert, Eye, EyeOff } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { GoogleButton } from '../components/GoogleButton';
import { StripeTexture } from '../components/StripeTexture';
import { login, saveToken } from '../api/auth';
import { bodoniLineHeight } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

// Handoff: Design-System/Guia Campo Belo App/design_handoff_login_guia_campo_belo/README.md
const GRAPHITE = '#1D1D1B';
const GOLD = '#C9AA6B';
const LIGHT = '#F3EEE4';
const LIGHT_50 = 'rgba(243,238,228,.5)';
const LIGHT_45 = 'rgba(243,238,228,.45)';
const LIGHT_42 = 'rgba(243,238,228,.42)';
const LIGHT_32 = 'rgba(243,238,228,.32)';
const LIGHT_20 = 'rgba(243,238,228,.2)';
const ERROR = '#B4726A';

const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

export function LoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [senhaFocused, setSenhaFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errorOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(errorOpacity, {
      toValue: error ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
    if (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [error, errorOpacity]);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await login(email, senha);
      await saveToken(res.token);
      navigation.replace('Main');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View
        style={[
          styles.container,
          { paddingTop: 24 + insets.top, paddingBottom: 30 + insets.bottom },
        ]}
        onLayout={(event: LayoutChangeEvent) => {
          const { width, height } = event.nativeEvent.layout;
          setLayout({ width, height });
        }}
      >
        <StripeTexture width={layout.width} height={layout.height} />

        <Pressable onPress={() => navigation.navigate('Capa')} style={styles.backButton} hitSlop={8}>
          <Text style={styles.backGlyph}>←</Text>
        </Pressable>

        <View style={{ flex: 1 }} />

        <View>
          <Text style={styles.eyebrow}>BEM-VINDO DE VOLTA</Text>
          <Text style={styles.h2}>Entrar</Text>

          <View style={styles.fields}>
            <View>
              <Text style={styles.fieldLabel}>E-MAIL</Text>
              <TextInput
                style={[styles.input, emailFocused && styles.inputFocused]}
                placeholder="voce@email.com"
                placeholderTextColor={LIGHT_32}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <View>
              <Text style={styles.fieldLabel}>SENHA</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, styles.inputWithIcon, senhaFocused && styles.inputFocused]}
                  placeholder="••••••••"
                  placeholderTextColor={LIGHT_32}
                  value={senha}
                  onChangeText={setSenha}
                  onFocus={() => setSenhaFocused(true)}
                  onBlur={() => setSenhaFocused(false)}
                  secureTextEntry={!showPassword}
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={10}
                  style={styles.eyeToggle}
                >
                  {showPassword ? (
                    <EyeOff size={16} color={GOLD} strokeWidth={2} />
                  ) : (
                    <Eye size={16} color={GOLD} strokeWidth={2} />
                  )}
                </Pressable>
              </View>
            </View>
          </View>

          <Pressable style={styles.forgotLink} hitSlop={10}>
            <Text style={styles.forgotLinkText}>ESQUECI MINHA SENHA</Text>
          </Pressable>

          {error ? (
            <Animated.View style={[styles.errorRow, { opacity: errorOpacity }]}>
              <CircleAlert size={16} color={ERROR} strokeWidth={2} />
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          ) : null}

          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            style={[styles.cta, loading && styles.ctaLoading]}
          >
            <Text style={styles.ctaText}>{loading ? 'ENTRANDO…' : 'ENTRAR'}</Text>
          </Pressable>

          <GoogleButton />
        </View>

        <View style={{ flex: 1 }} />

        <Pressable onPress={() => navigation.navigate('Cadastro')} hitSlop={10}>
          <Text style={styles.footer}>
            Não tenho conta · <Text style={styles.footerLink}>Criar agora</Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: GRAPHITE,
    paddingHorizontal: 26,
  },
  backButton: {
    width: 40,
    height: 40,
    marginLeft: -4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: LIGHT_20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backGlyph: {
    fontSize: 16,
    color: LIGHT,
  },
  eyebrow: {
    fontFamily: MONO,
    fontWeight: '400',
    fontSize: 9,
    letterSpacing: 9 * 0.26,
    color: GOLD,
  },
  h2: {
    marginTop: 12,
    fontFamily: 'BodoniModa_400Regular',
    fontSize: 40,
    lineHeight: bodoniLineHeight(40),
    letterSpacing: 40 * -0.02,
    color: LIGHT,
  },
  fields: {
    marginTop: 30,
    gap: 22,
  },
  fieldLabel: {
    fontFamily: MONO,
    fontWeight: '400',
    fontSize: 8.5,
    letterSpacing: 8.5 * 0.2,
    color: LIGHT_42,
  },
  input: {
    marginTop: 6,
    width: '100%',
    height: 42,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_20,
    fontFamily: 'Jost_300Light',
    fontSize: 17,
    color: LIGHT,
  },
  inputFocused: {
    borderBottomColor: GOLD,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputWithIcon: {
    paddingRight: 28,
  },
  eyeToggle: {
    position: 'absolute',
    right: 0,
    top: 6,
    height: 42,
    justifyContent: 'center',
  },
  forgotLink: {
    marginTop: 16,
    alignSelf: 'flex-end',
  },
  forgotLinkText: {
    fontFamily: 'Jost_500Medium',
    fontSize: 10,
    letterSpacing: 10 * 0.14,
    color: LIGHT_45,
  },
  errorRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: -12,
    backgroundColor: 'rgba(180,114,106,.1)',
  },
  errorText: {
    flex: 1,
    fontFamily: 'Jost_500Medium',
    fontSize: 13,
    color: ERROR,
  },
  cta: {
    marginTop: 28,
    height: 56,
    width: '100%',
    borderRadius: 2,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLoading: {
    opacity: 0.7,
  },
  ctaText: {
    fontFamily: 'Jost_600SemiBold',
    fontSize: 11.5,
    letterSpacing: 11.5 * 0.2,
    color: GRAPHITE,
  },
  footer: {
    textAlign: 'center',
    fontFamily: 'Jost_300Light',
    fontSize: 12.5,
    color: LIGHT_50,
  },
  footerLink: {
    fontFamily: 'Jost_500Medium',
    color: GOLD,
  },
});
