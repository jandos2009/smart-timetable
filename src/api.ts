
type Item = {
  id: number;
  [key: string]: unknown;
};

const STORAGE_PREFIX = "smart-timetable-";

function readItems(path: string): Item[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_PREFIX + path) || "[]");
  } catch {
    return [];
  }
}

function saveItems(path: string, items: Item[]) {
  localStorage.setItem(STORAGE_PREFIX + path, JSON.stringify(items));
}

export async function api<T>(
  path: string,
  method = "GET",
  body?: unknown
): Promise<T> {
  // Получаем список
  if (method === "GET") {
    return readItems(path) as T;
  }

  // Добавляем новую запись
  if (method === "POST") {
    const item = body as Record<string, unknown>;

    if (path === "/lessons") {
      const lessons = readItems("/lessons");
      const teachers = readItems("/teachers");
      const groups = readItems("/groups");
      const rooms = readItems("/rooms");

      const teacher = teachers.find(
        x => x.id === Number(item.teacherId)
      );
      const group = groups.find(
        x => x.id === Number(item.groupId)
      );
      const room = rooms.find(
        x => x.id === Number(item.roomId)
      );

      if (!teacher || !group || !room) {
        throw new Error("Алдымен мұғалім, топ және аудитория қосыңыз");
      }

      if (Number(room.capacity) < Number(group.studentCount)) {
        throw new Error("Аудитория сыйымдылығы жеткіліксіз");
      }

      const overlaps = (a: Item, b: Record<string, unknown>) =>
        Number(a.weekday) === Number(b.weekday) &&
        String(a.startTime) < String(b.endTime) &&
        String(b.startTime) < String(a.endTime);

      const conflict = lessons.find(
        lesson =>
          overlaps(lesson, item) &&
          (
            Number(lesson.teacherId) === Number(item.teacherId) ||
            Number(lesson.groupId) === Number(item.groupId) ||
            Number(lesson.roomId) === Number(item.roomId)
          )
      );

      if (conflict) {
        if (Number(conflict.teacherId) === Number(item.teacherId)) {
          throw new Error("Мұғалім бұл уақытта бос емес");
        }
        if (Number(conflict.groupId) === Number(item.groupId)) {
          throw new Error("Топ бұл уақытта бос емес");
        }
        throw new Error("Аудитория бұл уақытта бос емес");
      }
    }

    const items = readItems(path);
    const newItem = {
      ...item,
      id: Math.max(0, ...items.map(x => x.id)) + 1,
    };

    saveItems(path, [...items, newItem]);
    return newItem as T;
  }

  // Удаляем занятие по ID
  if (method === "DELETE") {
    const match = path.match(/^\/lessons\/(\d+)$/);

    if (!match) {
      throw new Error("Қате мекенжай");
    }

    const id = Number(match[1]);
    const lessons = readItems("/lessons");
    const updated = lessons.filter(x => x.id !== id);

    if (updated.length === lessons.length) {
      throw new Error("Сабақ табылмады");
    }

    saveItems("/lessons", updated);
    return { success: true } as T;
  }

  throw new Error("Бұл сұраныс қолдау таппайды");

}
