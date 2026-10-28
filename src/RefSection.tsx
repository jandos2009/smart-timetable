import { useEffect, useState } from "react";
import { api } from "./api";

type Field = { key: string; label: string; type?: "text" | "number" };
type Props = { title: string; path: string; fields: Field[] };
type Item = Record<string, string | number>;

export default function RefSection({ title, path, fields }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  const load = async () => setItems(await api<Item[]>(path));

  useEffect(() => { load(); }, []);

  const add = async () => {
    setError("");
    try {
      const body: Item = {};
      for (const f of fields) {
        const value = form[f.key] ?? "";
        body[f.key] = f.type === "number" ? Number(value) : value;
      }
      await api(path, "POST", body);
      setForm({});
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <section>
      <h3>{title}</h3>
      {fields.map((f) => (
        <input
          key={f.key}
          type={f.type ?? "text"}
          placeholder={f.label}
          value={form[f.key] ?? ""}
          onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
        />
      ))}
      <button onClick={add}>Қосу</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {items.map((item) => (
          <li key={item.id}>{fields.map((f) => item[f.key]).join(" · ")}</li>
        ))}
      </ul>
    </section>
  );
}