import "./App.css";
import { useState } from "react";
import LessonForm from "./LessonForm";
import Timetable from "./Timetable";
import RefSection from "./RefSection";

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div style={{ padding: 16 }}>
      <LessonForm
      onAdded={() => {
      setRefreshKey(value => value + 1);
      alert("Сабақ қосылды");
  }}
/>

<Timetable refreshKey={refreshKey} />
    <div className="references-grid">
      <RefSection title="Мұғалімдер" path="/teachers"
        fields={[{ key: "name", label: "Аты-жөні" }]} />
      <RefSection title="Топтар" path="/groups"
        fields={[
          { key: "name", label: "Топ атауы" },
          { key: "studentCount", label: "Студент саны", type: "number" },
        ]} />
      <RefSection title="Пәндер" path="/subjects"
        fields={[{ key: "name", label: "Пән атауы" }]} />
      <RefSection title="Аудиториялар" path="/rooms"
        fields={[
          { key: "name", label: "Атауы" },
          { key: "capacity", label: "Сыйымдылығы", type: "number" },
          { key: "type", label: "Түрі" },
        ]} />
    </div>
  </div>
  );
}
