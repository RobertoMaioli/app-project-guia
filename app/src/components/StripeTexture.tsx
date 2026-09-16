import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { G, Line } from 'react-native-svg';

// Espaçamento e ângulo seguem o repeating-linear-gradient(101deg, ...) dos handoffs
// de design (splash e capa). Em CSS, o ângulo do gradiente define o eixo de
// transição de cor — as faixas resultantes ficam perpendiculares a esse eixo.
// Por isso a rotação aplicada às linhas (que já nascem verticais) é angle - 90.
type Props = {
  width: number;
  height: number;
  spacing?: number;
  angle?: number;
  opacity?: number;
};

export function StripeTexture({ width, height, spacing = 9, angle = 101, opacity = 0.02 }: Props) {
  const rotation = angle - 90;

  const { lines, diag } = useMemo(() => {
    if (!width || !height) return { lines: [] as number[], diag: 0 };
    const d = Math.ceil(Math.hypot(width, height)) + spacing * 2;
    const count = Math.ceil(d / spacing);
    return { lines: Array.from({ length: count }, (_, i) => i * spacing - d / 2), diag: d };
  }, [width, height, spacing]);

  if (!width || !height) return null;
  const cx = width / 2;
  const cy = height / 2;

  return (
    <Svg style={StyleSheet.absoluteFill} width={width} height={height}>
      <G transform={`rotate(${rotation} ${cx} ${cy})`}>
        {lines.map((offset) => (
          <Line
            key={offset}
            x1={cx + offset}
            y1={cy - diag / 2}
            x2={cx + offset}
            y2={cy + diag / 2}
            stroke="#FFFFFF"
            strokeWidth={2}
            strokeOpacity={opacity}
          />
        ))}
      </G>
    </Svg>
  );
}
