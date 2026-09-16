import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type LayoutChangeEvent,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Eye, EyeOff } from 'lucide-react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { GoogleButton } from '../components/GoogleButton';
import { StripeTexture } from '../components/StripeTexture';
import { cadastro, loginGoogle, saveToken } from '../api/auth';
import { isGoogleSignInCancelled, signInWithGoogle } from '../hooks/useGoogleAuth';
import { bodoniLineHeight } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Cadastro'>;

// Handoff: Design-System/Guia Campo Belo App/design_handoff_cadastro_guia_campo_belo/README.md
const GRAPHITE = '#1D1D1B';
const GREEN = '#3D4733';
const GREEN_DARK = '#2A3026';
const GOLD = '#C9AA6B';
const LIGHT = '#F3EEE4';
const LIGHT_58 = 'rgba(243,238,228,.58)';
const LIGHT_42 = 'rgba(243,238,228,.42)';
const LIGHT_32 = 'rgba(243,238,228,.32)';
const LIGHT_30 = 'rgba(243,238,228,.3)';
const LIGHT_24 = 'rgba(243,238,228,.24)';
const LIGHT_20 = 'rgba(243,238,228,.2)';
const ERROR = '#B4726A';

const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

const IMAGE_HEIGHT = 250;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Handoff: "Força de senha" — fio de 1px, largura 33/66/100%, cor fraca→média→forte,
// rótulo mono à direita. Nunca barras empilhadas nem ícones.
type ForcaSenha = { largura: `${number}%`; cor: string; rotulo: string } | null;

function calcularForcaSenha(senha: string): ForcaSenha {
  if (senha.length === 0) return null;
  if (senha.length < 8) {
    return { largura: '15%', cor: ERROR, rotulo: 'MÍNIMO 8 CARACTERES' };
  }
  let variedade = 0;
  if (/[a-z]/.test(senha)) variedade++;
  if (/[A-Z]/.test(senha)) variedade++;
  if (/[0-9]/.test(senha)) variedade++;
  if (/[^a-zA-Z0-9]/.test(senha)) variedade++;

  if (senha.length >= 10 && variedade >= 3) {
    return { largura: '100%', cor: '#3D4733', rotulo: 'SENHA FORTE' };
  }
  if (variedade >= 2) {
    return { largura: '66%', cor: GOLD, rotulo: 'SENHA MÉDIA' };
  }
  return { largura: '33%', cor: ERROR, rotulo: 'SENHA FRACA' };
}

export function CadastroScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [imgLayout, setImgLayout] = useState({ width: 0, height: 0 });
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nomeFocused, setNomeFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [senhaFocused, setSenhaFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const errorOpacity = useRef(new Animated.Value(0)).current;

  const emailValid = EMAIL_RE.test(email);
  const showEmailFormatError = emailTouched && email.length > 0 && !emailValid;
  const canSubmit = nome.trim().length > 0 && emailValid && senha.length >= 8 && termsAccepted;
  const forcaSenha = calcularForcaSenha(senha);

  useEffect(() => {
    Animated.timing(errorOpacity, {
      toValue: error ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
    if (error) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, [error, errorOpacity]);

  const handleGooglePress = async () => {
    setError(null);
    setEmailError(null);
    setGoogleLoading(true);
    try {
      const idToken = await signInWithGoogle();
      if (!idToken) return;
      const res = await loginGoogle(idToken);
      await saveToken(res.token);
      navigation.replace('Main');
    } catch (err) {
      if (isGoogleSignInCancelled(err)) return;
      const msg = err instanceof Error ? err.message : 'Não foi possível continuar com Google';
      if (msg.toLowerCase().includes('já existe')) {
        setEmailError(msg);
      } else {
        setError(msg);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    setError(null);
    setEmailError(null);
    setLoading(true);
    try {
      const res = await cadastro(nome.trim(), email.trim(), senha);
      await saveToken(res.token);
      navigation.replace('Main');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Não foi possível criar a conta';
      if (msg.toLowerCase().includes('já existe')) {
        setEmailError(msg);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={styles.imageBand}
          onLayout={(event: LayoutChangeEvent) => {
            const { width, height } = event.nativeEvent.layout;
            setImgLayout({ width, height });
          }}
        >
          {/* Placeholder do handoff — trocar pela fotografia real de rua/comércio da região */}
          <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
            <Defs>
              <LinearGradient id="photoPlaceholder" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={GREEN} stopOpacity={1} />
                <Stop offset="54%" stopColor={GREEN_DARK} stopOpacity={1} />
                <Stop offset="100%" stopColor={GRAPHITE} stopOpacity={1} />
              </LinearGradient>
            </Defs>
            <Rect x={0} y={0} width="100%" height="100%" fill="url(#photoPlaceholder)" />
          </Svg>
          <StripeTexture width={imgLayout.width} height={imgLayout.height} />
          <Text style={styles.photoPlaceholderLabel} pointerEvents="none">
            FOTOGRAFIA{'\n'}RUA DO CAMPO BELO
          </Text>
          <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
            <Defs>
              <LinearGradient id="imgOverlay" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={GRAPHITE} stopOpacity={0.3} />
                <Stop offset="40%" stopColor={GRAPHITE} stopOpacity={0.2} />
                <Stop offset="96%" stopColor={GRAPHITE} stopOpacity={1} />
              </LinearGradient>
            </Defs>
            <Rect x={0} y={0} width="100%" height="100%" fill="url(#imgOverlay)" />
          </Svg>

          <Pressable
            onPress={() => navigation.navigate('Capa')}
            style={[styles.backButton, { top: 20 + insets.top }]}
            hitSlop={8}
          >
            <Text style={styles.backGlyph}>←</Text>
          </Pressable>
        </View>

        <View style={[styles.content, { paddingBottom: 30 + insets.bottom }]}>
          <Text style={styles.h2}>Criar conta</Text>

          <View style={styles.fields}>
            <View>
              <Text style={styles.fieldLabel}>NOME</Text>
              <TextInput
                style={[styles.input, nomeFocused && styles.inputFocused]}
                placeholder="Seu nome"
                placeholderTextColor={LIGHT_32}
                value={nome}
                onChangeText={setNome}
                onFocus={() => setNomeFocused(true)}
                onBlur={() => setNomeFocused(false)}
                autoCapitalize="words"
              />
            </View>

            <View>
              <Text style={styles.fieldLabel}>E-MAIL</Text>
              <TextInput
                style={[
                  styles.input,
                  emailFocused && styles.inputFocused,
                  (showEmailFormatError || emailError) && styles.inputError,
                ]}
                placeholder="voce@email.com"
                placeholderTextColor={LIGHT_32}
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  setEmailError(null);
                }}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => {
                  setEmailFocused(false);
                  setEmailTouched(true);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {emailError ? (
                <View style={styles.emailErrorRow}>
                  <Text style={styles.emailErrorText}>{emailError.toUpperCase()}</Text>
                  <Pressable onPress={() => navigation.navigate('Login')} hitSlop={10}>
                    <Text style={styles.emailErrorLink}>ENTRAR</Text>
                  </Pressable>
                </View>
              ) : showEmailFormatError ? (
                <Text style={styles.emailErrorText}>E-MAIL INVÁLIDO</Text>
              ) : null}
            </View>

            <View>
              <Text style={styles.fieldLabel}>SENHA</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, styles.inputWithIcon, senhaFocused && styles.inputFocused]}
                  placeholder="Mínimo 8 caracteres"
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
              {forcaSenha ? (
                <View style={styles.forcaSenhaWrap}>
                  <View style={styles.forcaSenhaTrack}>
                    <View
                      style={[
                        styles.forcaSenhaFill,
                        { width: forcaSenha.largura, backgroundColor: forcaSenha.cor },
                      ]}
                    />
                  </View>
                  <Text style={[styles.forcaSenhaLabel, { color: forcaSenha.cor }]}>
                    {forcaSenha.rotulo}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <Pressable
            style={styles.termsRow}
            onPress={() => setTermsAccepted((v) => !v)}
            hitSlop={4}
          >
            <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
              {termsAccepted ? <Text style={styles.checkboxGlyph}>✓</Text> : null}
            </View>
            <Text style={styles.termsText}>
              Aceito os{' '}
              <Text style={styles.termsLink} onPress={() => {}}>
                termos de uso
              </Text>{' '}
              e a{' '}
              <Text style={styles.termsLink} onPress={() => {}}>
                política de privacidade
              </Text>{' '}
              do Guia Campo Belo & Região.
            </Text>
          </Pressable>

          {error ? (
            <Animated.View style={[styles.errorRow, { opacity: errorOpacity }]}>
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          ) : null}

          <View style={styles.spacer} />

          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit || loading}
            style={[styles.cta, !canSubmit && styles.ctaDisabled, loading && styles.ctaLoading]}
          >
            <Text style={styles.ctaText}>{loading ? 'CRIANDO CONTA…' : 'CADASTRAR'}</Text>
          </Pressable>

          <GoogleButton
            label={googleLoading ? 'CONTINUANDO…' : 'CONTINUAR COM GOOGLE'}
            onPress={handleGooglePress}
          />

          <Pressable onPress={() => navigation.navigate('Login')} hitSlop={10} style={styles.footer}>
            <Text style={styles.footerText}>
              Já tenho conta · <Text style={styles.footerLink}>Entrar</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: GRAPHITE,
  },
  scrollContent: {
    flexGrow: 1,
  },
  imageBand: {
    height: IMAGE_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },
  photoPlaceholderLabel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 26,
    textAlignVertical: 'center',
    fontFamily: MONO,
    fontWeight: '400',
    fontSize: 9,
    letterSpacing: 9 * 0.3,
    lineHeight: 16,
    color: LIGHT_24,
  },
  backButton: {
    position: 'absolute',
    left: 22,
    width: 40,
    height: 40,
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
  content: {
    marginTop: -34,
    paddingHorizontal: 26,
    flex: 1,
  },
  h2: {
    fontFamily: 'BodoniModa_400Regular',
    fontSize: 36,
    lineHeight: bodoniLineHeight(36),
    letterSpacing: 36 * -0.02,
    color: LIGHT,
  },
  fields: {
    marginTop: 28,
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
  inputError: {
    borderBottomColor: ERROR,
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
  forcaSenhaWrap: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  forcaSenhaTrack: {
    flex: 1,
    height: 1,
    backgroundColor: LIGHT_20,
  },
  forcaSenhaFill: {
    height: 1,
  },
  forcaSenhaLabel: {
    fontFamily: MONO,
    fontWeight: '400',
    fontSize: 8,
    letterSpacing: 8 * 0.14,
  },
  emailErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emailErrorText: {
    flex: 1,
    marginTop: 6,
    fontFamily: MONO,
    fontWeight: '400',
    fontSize: 8.5,
    letterSpacing: 8.5 * 0.14,
    color: ERROR,
  },
  emailErrorLink: {
    fontFamily: 'Jost_500Medium',
    fontSize: 9.5,
    letterSpacing: 9.5 * 0.14,
    color: GOLD,
  },
  termsRow: {
    marginTop: 26,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 13,
  },
  checkbox: {
    marginTop: 2,
    width: 19,
    height: 19,
    borderWidth: 1,
    borderColor: LIGHT_30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: GOLD,
    borderColor: GOLD,
  },
  checkboxGlyph: {
    fontSize: 11,
    color: GRAPHITE,
  },
  termsText: {
    flex: 1,
    fontFamily: 'Jost_300Light',
    fontSize: 12.5,
    lineHeight: 12.5 * 1.55,
    color: LIGHT_58,
  },
  termsLink: {
    textDecorationLine: 'underline',
  },
  errorRow: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: -12,
    backgroundColor: 'rgba(180,114,106,.1)',
  },
  errorText: {
    fontFamily: 'Jost_500Medium',
    fontSize: 13,
    color: ERROR,
  },
  spacer: {
    flex: 1,
    minHeight: 24,
  },
  cta: {
    height: 56,
    width: '100%',
    borderRadius: 2,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDisabled: {
    opacity: 0.4,
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
    marginTop: 20,
    alignSelf: 'center',
  },
  footerText: {
    textAlign: 'center',
    fontFamily: 'Jost_300Light',
    fontSize: 12.5,
    color: 'rgba(243,238,228,.5)',
  },
  footerLink: {
    fontFamily: 'Jost_500Medium',
    color: GOLD,
  },
});
