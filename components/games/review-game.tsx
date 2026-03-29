"use client";

import { useState, useEffect } from "react";
import { topics } from "@/lib/vocabulary-data";

export default function ReviewGame() {
  const [mounted, setMounted] = useState(false);
  const [topic, setTopic] = useState("");

  // chỉ chạy ở client
  useEffect(() => {
    setMounted(true);
    if (topics.length > 0) {
      setTopic(topics[0].id);
    }
  }, []);

  // 🚨 chưa mount thì không render gì
  if (!mounted) return null;

  const words = topics.find((t) => t.id === topic)?.words || [];

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">📖 Ôn tập từ vựng</h1>

      <h2 className="mb-4">
        🪴 Đi chậm cũng được miễn là bản thân không dừng lại 🫀🍀
      </h2>

      <select
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        className="p-2 border rounded mb-4"
      >
        {topics.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      <p className="mb-2 text-gray-500">Tổng: {words.length} từ</p>

      {words.length === 0 ? (
        <p>⚠️ Không có dữ liệu</p>
      ) : (
        <div className="space-y-3">
          {words.map((item, index) => (
            <div
              key={index}
              className="p-4 rounded-xl bg-white shadow flex justify-between"
            >
              <span className="text-blue-600 font-semibold">
                {item.english}
              </span>
              <span>{item.vietnamese}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
