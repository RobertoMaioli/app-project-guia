import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  type LayoutChangeEvent,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { MapPin } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { StripeTexture } from '../components/StripeTexture';
import { useStats } from '../api/stats';
import { bodoniLineHeight } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Capa'>;

// Handoff: Design-System/Guia Campo Belo App/design_handoff_capa_guia_campo_belo/README.md
const GRAPHITE = '#1D1D1B';
const GOLD = '#C9AA6B';
const LIGHT = '#F3EEE4';
const LIGHT_60 = 'rgba(243,238,228,.6)';
const LIGHT_40 = 'rgba(243,238,228,.4)';
const LIGHT_14 = 'rgba(243,238,228,.14)';

const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

export function CapaScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const [pressed, setPressed] = useState(false);
  const zoom = useRef(new Animated.Value(1)).current;
  const { data: stats } = useStats();

  // Fallback hardcoded caso a API não responda — essa tela é pré-login, não pode quebrar por rede.
  const STATS = [
    { n: stats ? `+${stats.totalLugares}` : '+25', label: 'EMPRESAS' },
    { n: stats ? `+${stats.totalCategorias}` : '+33', label: 'CATEGORIAS' },
    { n: '0,935', label: 'IDH DO BAIRRO' },
  ];

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width, height });
  };

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(zoom, { toValue: 1.08, duration: 22000, useNativeDriver: true }),
        Animated.timing(zoom, { toValue: 1, duration: 22000, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [zoom]);

  return (
    <View style={styles.container} onLayout={onLayout}>
      <Animated.Image
        source={require('../../assets/photos/capa.webp')}
        style={[StyleSheet.absoluteFill, { transform: [{ scale: zoom }] }]}
        resizeMode="cover"
        accessibilityLabel=""
      />
      {/* Opacidade bem acima do valor "oficial" (.022) do handoff: sobre uma foto real
          e detalhada, a textura fica praticamente invisível nesse nível — só se percebe
          claramente em fundos lisos (como o gradiente da splash). */}
      <StripeTexture width={layout.width} height={layout.height} opacity={0.1} />
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
        <Defs>
          <LinearGradient id="veil" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={GRAPHITE} stopOpacity={0.85} />
            <Stop offset="12%" stopColor={GRAPHITE} stopOpacity={0.55} />
            <Stop offset="26%" stopColor={GRAPHITE} stopOpacity={0} />
            <Stop offset="62%" stopColor={GRAPHITE} stopOpacity={0.72} />
            <Stop offset="88%" stopColor={GRAPHITE} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill="url(#veil)" />
      </Svg>

      <View
        style={[
          styles.content,
          { paddingTop: 26 + insets.top, paddingBottom: 32 + insets.bottom },
        ]}
      >
        <View style={styles.header}>
          <Image
            source={require('../../assets/brand/logo-pin-dourado.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Guia Campo Belo & Região"
          />
          <Pressable onPress={() => navigation.navigate('Login')} hitSlop={8} style={styles.entrarButton}>
            <Text style={styles.entrarLink}>ENTRAR</Text>
          </Pressable>
        </View>

        <View style={{ flex: 1 }} />

        <View>
          <View style={styles.eyebrowRow}>
            <MapPin size={12} color={LIGHT} strokeWidth={2} />
            <Text style={styles.eyebrow}>Zona Sul · Campo Belo e Região</Text>
          </View>
          <View style={styles.h1Block}>
            <Text style={styles.h1}>O melhor de</Text>
            <Text style={[styles.h1, styles.h1TightLine]}>Campo Belo</Text>
            <Text style={[styles.h1, styles.h1Italic, styles.h1TightLine]}>e região.</Text>
          </View>
          <Text style={styles.paragraph}>
            Do café da manhã ao jantar: os lugares que valem seu tempo por aqui.
          </Text>

          <View style={styles.statsRow}>
            {STATS.map((stat) => (
              <View key={stat.label}>
                <Text style={styles.statNumber}>{stat.n}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          <Pressable
            onPress={() => navigation.navigate('Cadastro')}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            style={[styles.cta, pressed && styles.ctaPressed]}
          >
            <Text style={styles.ctaText}>CRIAR MINHA CONTA</Text>
            <Text style={styles.ctaArrow}>→</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GRAPHITE,
    overflow: 'hidden',
  },
  content: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 26,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    width: 74,
    height: 74 * (518 / 500),
  },
  entrarButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(243,238,228,.5)',
    backgroundColor: 'rgba(243,238,228,.14)',
  },
  entrarLink: {
    fontFamily: 'Jost_600SemiBold',
    fontSize: 11.5,
    letterSpacing: 11.5 * 0.18,
    color: LIGHT,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eyebrow: {
    fontFamily: MONO,
    fontWeight: '400',
    fontSize: 9,
    letterSpacing: 9 * 0.26,
    color: GOLD,
  },
  h1Block: {
    marginTop: 16,
  },
  h1: {
    fontFamily: 'BodoniModa_400Regular',
    fontSize: 52,
    // O efeito compacto do handoff (.95) vem do h1TightLine (margem negativa) —
    // lineHeight em si fica no valor seguro padronizado (ver theme/typography.ts).
    lineHeight: bodoniLineHeight(52),
    letterSpacing: 52 * -0.02,
    color: LIGHT,
  },
  h1TightLine: {
    marginTop: -14,
  },
  h1Italic: {
    fontFamily: 'BodoniModa_400Regular_Italic',
    color: GOLD,
  },
  paragraph: {
    marginTop: 18,
    maxWidth: 280,
    fontFamily: 'Jost_300Light',
    fontSize: 14.5,
    lineHeight: 14.5 * 1.6,
    color: LIGHT_60,
  },
  statsRow: {
    marginTop: 26,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: LIGHT_14,
    flexDirection: 'row',
    gap: 26,
  },
  statNumber: {
    fontFamily: 'BodoniModa_400Regular',
    fontSize: 21,
    color: LIGHT,
  },
  statLabel: {
    marginTop: 3,
    fontFamily: MONO,
    fontWeight: '400',
    fontSize: 8.5,
    letterSpacing: 8.5 * 0.16,
    color: LIGHT_40,
  },
  cta: {
    marginTop: 24,
    height: 56,
    width: '100%',
    borderRadius: 2,
    backgroundColor: GOLD,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  ctaPressed: {
    transform: [{ scale: 0.99 }],
  },
  ctaText: {
    fontFamily: 'Jost_600SemiBold',
    fontSize: 11.5,
    letterSpacing: 11.5 * 0.2,
    color: GRAPHITE,
  },
  ctaArrow: {
    fontSize: 13,
    color: GRAPHITE,
  },
});
