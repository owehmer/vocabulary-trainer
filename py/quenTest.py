import ollama

response = ollama.chat(
  model="qwen3:8b",
  messages=[{"role": "user", "content": "Schreibe einen Dialog auf Schweizerdeutsch (Zürich)."}]
)
print(response["message"]["content"])
