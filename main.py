# main.py
from subconscious import Subconscious

client = Subconscious(api_key="sk-de37b0d6e678c44f51ef7b18d9b2b2a9e1721fc175b51fbaf55c914713b35e9a")

run = client.run(
    engine="tim-gpt",
    input={
        "instructions": """Use Web Search to find what subconscious.dev does and why it is useful.
Return a concise explanation with 3 practical use cases.""",
        "tools": [{"type": "platform", "id": "web_search"}],
    },
    options={"await_completion": True},
)

print(run.result.answer)
