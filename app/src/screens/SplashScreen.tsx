import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Image,
  type LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { StripeTexture } from '../components/StripeTexture';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

// Handoff: Design-System/Guia Campo Belo App/design_handoff_splash_guia_campo_belo/README.md
const GRAPHITE = '#1D1D1B';
const GREEN = '#3D4733';
const GREEN_DARK = '#2A3026';
const GOLD = '#C9AA6B';
const GOLD_50 = 'rgba(201,170,107,.5)';
const WARM_GRAY = '#8B8589';
const LIGHT_42 = 'rgba(243,238,228,.42)';
const LIGHT_12 = 'rgba(243,238,228,.12)';

const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

export function SplashScreen({ navigation }: Props) {
  const [load, setLoad] = useState(0);
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const navigatedRef = useRef(false);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width, height });
  };

  const goNext = () => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    navigation.replace('Capa');
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (reduced) {
        setLoad(100);
        return;
      }
      interval = setInterval(() => {
        setLoad((prev) => {
          const next = prev + 7;
          if (next >= 100) {
            if (interval) clearInterval(interval);
            return 100;
          }
          return next;
        });
      }, 90);
    });

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (load >= 100) goNext();
  }, [load]);

  return (
    <Pressable onPress={goNext} onLayout={onLayout} style={styles.container}>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <RadialGradient id="bgRadial" cx="50%" cy="42%" rx="90%" ry="70%">
            <Stop offset="0%" stopColor={GREEN} stopOpacity={1} />
            <Stop offset="46%" stopColor={GREEN_DARK} stopOpacity={1} />
            <Stop offset="100%" stopColor={GRAPHITE} stopOpacity={1} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill="url(#bgRadial)" />
      </Svg>
      <StripeTexture width={layout.width} height={layout.height} />

      <View style={styles.brandBlock} pointerEvents="none">
        <Image
          source={require('../../assets/brand/logo-pin-dourado.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Guia Campo Belo & Região"
        />
        <View style={styles.signature}>
          <View style={styles.signatureRule} />
          <Text style={styles.signatureLabel}>Dica boa não fica solta… fica Salva!</Text>
        </View>
      </View>

      <View style={styles.footer} pointerEvents="none">
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${load}%` }]} />
        </View>
        <Text style={styles.footerLabel}>CURADORIA 2026 · SÃO PAULO</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GRAPHITE,
    overflow: 'hidden',
  },
  brandBlock: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 26,
  },
  logo: {
    // Handoff especifica 186px; reduzido a pedido do usuário por ficar grande demais em dispositivo real.
    // Largura e altura fixas (em vez de aspectRatio) para eliminar qualquer ambiguidade de cálculo.
    width: 250,
    height: 259,
  },
  signature: {
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  signatureRule: {
    width: 28,
    height: 1,
    backgroundColor: GOLD_50,
  },
  signatureLabel: {
    fontFamily: MONO,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 14 * 0.3,
    color: WARM_GRAY,
    textAlign: 'center',
    maxWidth: 220,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 26,
    paddingBottom: 34,
    alignItems: 'center',
    gap: 18,
  },
  progressTrack: {
    width: '100%',
    height: 1,
    backgroundColor: LIGHT_12,
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 1,
    backgroundColor: GOLD,
  },
  footerLabel: {
    fontFamily: MONO,
    fontWeight: '400',
    fontSize: 8.5,
    letterSpacing: 8.5 * 0.26,
    color: LIGHT_42,
  },
});
