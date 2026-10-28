
import { useEffect, useState } from "react";
import { api } from "./api";
import type { Teacher, Group, Subject, Room } from "./types";

const DAYS = [
  "Дүйсенбі",
  "Сейсенбі",
  "Сәрсенбі",
  "Бейсенбі",
  "Жұма",
];

export default function LessonForm({
  onAdded,
}: {
  onAdded: () => void;
}) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    subjectId: "",
    teacherId: "",
    groupId: "",
    roomId: "",
    weekday: "1",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    async function loadReferences() {
      try {
        const [s, t, g, r] = await Promise.all([
          api<Subject[]>("/subjects"),
          api<Teacher[]>("/teachers"),
          api<Group[]>("/groups"),
          api<Room[]>("/rooms"),
        ]);

        setSubjects(s);
        setTeachers(t);
        setGroups(g);
        setRooms(r);
      } catch (e) {
        setError("Не удалось загрузить справочники: " + (e as Error).message);
      }
    }

    void loadReferences();
  }, []);

  const set = (key: keyof typeof form, value: string) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const submit = async () => {
    setError("");

    if (
      !form.subjectId ||
      !form.teacherId ||
      !form.groupId ||
      !form.roomId ||
      !form.startTime ||
      !form.endTime
    ) {
      setError("Заполни все поля");
      return;
    }

    if (form.endTime <= form.startTime) {
      setError("Время окончания должно быть позже начала");
      return;
    }

    setLoading(true);

    try {
      await api("/lessons", "POST", {
        subjectId: Number(form.subjectId),
        teacherId: Number(form.teacherId),
        groupId: Number(form.groupId),
        roomId: Number(form.roomId),
        weekday: Number(form.weekday),
        startTime: form.startTime,
        endTime: form.endTime,
      });

      setForm({
        subjectId: "",
        teacherId: "",
        groupId: "",
        roomId: "",
        weekday: "1",
        startTime: "",
        endTime: "",
      });

      onAdded();
    } catch (e) {
      setError("Сабақ қосылмады: " + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="lesson-form-section">
      <div className="lesson-form-heading">
        <div>
          <h2>Сабақ қосу</h2>
          <p>Заполни данные, чтобы добавить занятие в расписание</p>
        </div>
        <span className="lesson-form-badge">НОВОЕ ЗАНЯТИЕ</span>
      </div>

      <div className="lesson-form-grid">
        <label>
          <span>Предмет</span>
          <select
            value={form.subjectId}
            onChange={(e) => set("subjectId", e.target.value)}
          >
            <option value="">Выбери предмет</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Преподаватель</span>
          <select
            value={form.teacherId}
            onChange={(e) => set("teacherId", e.target.value)}
          >
            <option value="">Выбери преподавателя</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Группа</span>
          <select
            value={form.groupId}
            onChange={(e) => set("groupId", e.target.value)}
          >
            <option value="">Выбери группу</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Аудитория</span>
          <select
            value={form.roomId}
            onChange={(e) => set("roomId", e.target.value)}
          >
            <option value="">Выбери аудиторию</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </label>

        <label>
          <span>День недели</span>
          <select
            value={form.weekday}
            onChange={(e) => set("weekday", e.target.value)}
          >
            {DAYS.map((day, i) => (
              <option key={day} value={i + 1}>{day}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Время начала</span>
          <input
            type="time"
            value={form.startTime}
            onChange={(e) => set("startTime", e.target.value)}
          />
        </label>

        <label>
          <span>Время окончания</span>
          <input
            type="time"
            value={form.endTime}
            onChange={(e) => set("endTime", e.target.value)}
          />
        </label>
      </div>

      {error && (
        <p className="lesson-form-error" role="alert">{error}</p>
      )}

      <div className="lesson-form-actions">
        <button onClick={submit} disabled={loading}>
          {loading ? "Сохранение..." : "＋ Сохранить занятие"}
        </button>
      </div>
    </section>
  );
}
