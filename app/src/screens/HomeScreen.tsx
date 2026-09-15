import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { useCategorias } from '../api/categorias';

export function HomeScreen() {
  const { data: categorias, isLoading, isError, error } = useCategorias();

  return (
    <View className="flex-1 bg-cream px-4 pt-16">
      <Text className="text-2xl font-bold text-ink mb-4">Guia Campo Belo</Text>

      {isLoading && <ActivityIndicator />}
      {isError && (
        <Text className="text-red-600">Erro ao carregar categorias: {(error as Error).message}</Text>
      )}

      <FlatList
        data={categorias}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View className="bg-white rounded-2xl px-4 py-3 mb-2">
            <Text className="text-ink">{item.label}</Text>
          </View>
        )}
      />
    </View>
  );
}
