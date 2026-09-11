import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LINES, clockNow, nextTrains, type Station, type Train } from "./src/schedule";

const LINE = LINES[0];

export default function App() {
  const [stationId, setStationId] = useState("retiro");
  const [picker, setPicker] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const station = LINE.stations.find((s) => s.id === stationId) ?? LINE.stations[0];
  const clock = clockNow(now);
  const trains = useMemo(() => nextTrains(LINE, station.id, now), [station.id, now]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.page}>
        <Text style={styles.kicker}>{LINE.name}</Text>
        <Text style={styles.title}>Próximo</Text>
        <Text style={styles.meta}>
          {clock.label} · {clock.weekend ? "finde / feriado no" : "día hábil"} · horario programado
        </Text>

        <Pressable style={styles.stationBtn} onPress={() => setPicker(true)}>
          <Text style={styles.stationLabel}>Estación</Text>
          <Text style={styles.stationName}>{station.name}</Text>
          <Text style={styles.stationHint}>tocá para cambiar</Text>
        </Pressable>

        <View style={styles.row}>
          <DirectionCard title="Hacia Tigre" trains={trains.toTigre} empty="No hay más hacia Tigre hoy" />
          <DirectionCard title="Hacia Retiro" trains={trains.toRetiro} empty="No hay más hacia Retiro hoy" />
        </View>

        <Text style={styles.foot}>
          Frecuencia hábil ~15 min, finde ~25 min. Mañana se pueden sumar ramales.
        </Text>
      </View>

      <Modal visible={picker} animationType="slide" onRequestClose={() => setPicker(false)}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.page}>
            <Text style={styles.kicker}>Elegí estación</Text>
            <FlatList
              data={LINE.stations}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <StationRow
                  station={item}
                  selected={item.id === station.id}
                  onPress={() => {
                    setStationId(item.id);
                    setPicker(false);
                  }}
                />
              )}
            />
            <Pressable style={styles.close} onPress={() => setPicker(false)}>
              <Text style={styles.closeText}>Cerrar</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function DirectionCard({
  title,
  trains,
  empty,
}: {
  title: string;
  trains: Train[];
  empty: string;
}) {
  const [next, ...rest] = trains;
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {next ? (
        <>
          <Text style={styles.bigTime}>{next.clock}</Text>
          <Text style={styles.inMin}>{next.inMin <= 1 ? "ahora" : `en ${next.inMin} min`}</Text>
          {rest.map((train) => (
            <Text key={train.clock} style={styles.later}>
              {train.clock} · en {train.inMin} min
            </Text>
          ))}
        </>
      ) : (
        <Text style={styles.empty}>{empty}</Text>
      )}
    </View>
  );
}

function StationRow({
  station,
  selected,
  onPress,
}: {
  station: Station;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.stationRow, selected && styles.stationRowOn]}>
      <Text style={[styles.stationRowText, selected && styles.stationRowTextOn]}>{station.name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B1220" },
  page: { flex: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  kicker: {
    color: "#C9A227",
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  title: { color: "#F4EFE4", fontSize: 40, fontWeight: "800", marginTop: 6 },
  meta: { color: "#8B93A7", marginTop: 6, marginBottom: 20 },
  stationBtn: {
    backgroundColor: "#151C2E",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#243049",
  },
  stationLabel: { color: "#8B93A7", fontSize: 12 },
  stationName: { color: "#F4EFE4", fontSize: 24, fontWeight: "700", marginTop: 4 },
  stationHint: { color: "#C9A227", marginTop: 6, fontSize: 12 },
  row: { flexDirection: "row", gap: 12, marginTop: 16, flex: 1 },
  card: {
    flex: 1,
    backgroundColor: "#151C2E",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#243049",
  },
  cardTitle: { color: "#C9A227", fontWeight: "700", marginBottom: 8 },
  bigTime: { color: "#F4EFE4", fontSize: 32, fontWeight: "800" },
  inMin: { color: "#F4EFE4", marginTop: 4, marginBottom: 12, fontSize: 16 },
  later: { color: "#8B93A7", marginTop: 4 },
  empty: { color: "#8B93A7", marginTop: 8, lineHeight: 20 },
  foot: { color: "#5C657A", fontSize: 12, marginTop: 16 },
  stationRow: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#243049" },
  stationRowOn: { backgroundColor: "#1B2438", marginHorizontal: -8, paddingHorizontal: 8, borderRadius: 8 },
  stationRowText: { color: "#F4EFE4", fontSize: 18 },
  stationRowTextOn: { color: "#C9A227", fontWeight: "700" },
  close: { marginTop: 12, alignSelf: "center", padding: 12 },
  closeText: { color: "#C9A227", fontWeight: "700" },
});
