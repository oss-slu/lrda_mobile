import React from "react";
import { View } from "react-native";
import Skeleton from "./Skeleton";

export default function NoteSkeleton() {
  return (
    <View>
      {Array.from({ length: 7 }, (_, i) => (
        <View key={i} style={{ width: "98%", alignSelf: "center", padding: 10, borderRadius: 20, flexDirection: "row" }}>
          <Skeleton width={100} height={100} borderRadius={10} color="#ffff" style={{ marginRight: 20 }} />
          <View style={{ flex: 1 }}>
            <Skeleton width="80%" height={20} color="#ffff" style={{ marginTop: 10, marginBottom: 8 }} />
            <Skeleton width="40%" height={13} color="#ffff" style={{ marginBottom: 8 }} />
            <Skeleton width="30%" height={13} color="#ffff" />
          </View>
        </View>
      ))}
    </View>
  );
}
