import { Pressable, StyleSheet, Text, type GestureResponderEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// Handoff (login/cadastro): botão fantasma 56px, borda rgba(243,238,228,.18),
// disco de 15px com gradiente cônico. SVG não tem conic-gradient nativo — aproximamos
// com 4 fatias (cores do logo do Google), já que a marca oficial não pode ser usada
// como placeholder antes da integração real.
const DISC_COLORS = ['#4285F4', '#34A853', '#FBBC05', '#EA4335'];

function wedgePath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startDeg));
  const y1 = cy + r * Math.sin(toRad(startDeg));
  const x2 = cx + r * Math.cos(toRad(endDeg));
  const y2 = cy + r * Math.sin(toRad(endDeg));
  return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`;
}

function GoogleDisc() {
  const size = 15;
  const r = size / 2;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {DISC_COLORS.map((color, i) => (
        <Path key={color} d={wedgePath(r, r, r, i * 90, (i + 1) * 90)} fill={color} />
      ))}
    </Svg>
  );
}

interface Props {
  label?: string;
  onPress?: (event: GestureResponderEvent) => void;
}

export function GoogleButton({ label = 'ENTRAR COM GOOGLE', onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <GoogleDisc />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 12,
    height: 56,
    width: '100%',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(243,238,228,.18)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  label: {
    fontFamily: 'Jost_500Medium',
    fontSize: 11.5,
    letterSpacing: 11.5 * 0.2,
    color: '#F3EEE4',
  },
});
