import json

with open("scraper/data/glossary.json", "r") as f:
    original_glossary = json.load(f)
with open("docs/coursecode_glossary_appendix.json", "r") as f:
    appendix = json.load(f)

for prefix, meaning in appendix["known"].items():
    if prefix not in original_glossary:
        original_glossary[prefix] = meaning
for prefix, meaning in appendix["llm_guesses"].items():
    if prefix not in original_glossary:
        original_glossary[prefix] = meaning

with open("data/glossary.json", "w") as f:
    json.dump(original_glossary, f, indent=1)