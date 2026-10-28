
import { useEffect, useState } from "react";
import { api } from "./api";

type Reference = {
  id: number;
  name: string;
};

type Lesson = {
  id: number;
  subjectId: number;
  teacherId: number;
  groupId: number;
  roomId: number;
  weekday: number;
  startTime: string;
  endTime: string;
};

const DAYS = [
  "Дүйсенбі",
  "Сейсенбі",
  "Сәрсенбі",
  "Бейсенбі",
  "Жұма",
];

export default function Timetable({
  refreshKey = 0,
}: {
  refreshKey?: number;
}) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [subjects, setSubjects] = useState<Reference[]>([]);
  const [teachers, setTeachers] = useState<Reference[]>([]);
  const [groups, setGroups] = useState<Reference[]>([]);
  const [rooms, setRooms] = useState<Reference[]>([]);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setError("");

      const [l, s, t, g, r] = await Promise.all([
        api<Lesson[]>("/lessons"),
        api<Reference[]>("/subjects"),
        api<Reference[]>("/teachers"),
        api<Reference[]>("/groups"),
        api<Reference[]>("/rooms"),
      ]);

      setLessons(l);
      setSubjects(s);
      setTeachers(t);
      setGroups(g);
      setRooms(r);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    void loadData();
  }, [refreshKey]);

  async function deleteLesson(id: number) {
    if (!window.confirm("Удалить это занятие?")) return;

    try {
      await api(`/lessons/${id}`, "DELETE");
      await loadData();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function getName(items: Reference[], id: number) {
    return items.find(item => item.id === id)?.name ?? "Не найдено";
  }

  return (
    <section style={{ marginTop: 32 }}>
      <h2>Апталық сабақ кестесі</h2>

      {error && (
        <p style={{ color: "red" }}>{error}</p>
      )}

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: 850,
          }}
        >
          <thead>
            <tr>
              {DAYS.map(day => (
                <th
                  key={day}
                  style={{
                    border: "1px solid #ccc",
                    padding: 10,
                    background: "#eaf2ff",
                  }}
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            <tr>
              {DAYS.map((day, index) => {
                const dayLessons = lessons
                  .filter(lesson => lesson.weekday === index + 1)
                  .sort((a, b) =>
                    a.startTime.localeCompare(b.startTime)
                  );

                return (
                  <td
                    key={day}
                    style={{
                      border: "1px solid #ccc",
                      padding: 8,
                      verticalAlign: "top",
                      minWidth: 150,
                    }}
                  >
                    {dayLessons.length === 0 && (
                      <p style={{ color: "#888" }}>
                        Сабақ жоқ
                      </p>
                    )}

                    {dayLessons.map(lesson => (
                      <article
                        key={lesson.id}
                        style={{
                          background: "#f0f6ff",
                          border: "1px solid #b8d1ff",
                          borderRadius: 8,
                          padding: 10,
                          marginBottom: 10,
                        }}
                      >
                        <strong>
                          {lesson.startTime} – {lesson.endTime}
                        </strong>

                        <p>
                          Пән: {getName(subjects, lesson.subjectId)}
                        </p>
                        <p>
                          Мұғалім: {getName(teachers, lesson.teacherId)}
                        </p>
                        <p>
                          Топ: {getName(groups, lesson.groupId)}
                        </p>
                        <p>
                          Аудитория: {getName(rooms, lesson.roomId)}
                        </p>

                        <button
                          onClick={() => deleteLesson(lesson.id)}
                        >
                          Жою
                        </button>
                      </article>
                    ))}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
