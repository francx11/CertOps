# /theory — Generate theory study guide for a certification domain

Generates a comprehensive Markdown theory guide in Spanish for a specific domain of a certification, based on the `index.md` and `questions.json` for that cert.

## Usage

```
/theory <cert-slug> <domain-number>
```

Examples:
- `/theory aws-ai-practitioner 1`
- `/theory aws-ai-practitioner 2`

If no cert slug is given, list available certifications and ask.
If no domain number is given, list domains from the cert's `theory/index.md` and ask which one.

## Before generating

1. Read `certifications/<cert>/theory/index.md` — find the section for the requested domain (D<N>). Extract:
   - Domain title and official weight %
   - List of question numbers belonging to this domain
   - Concept frequency table (what topics appear most)
   - Quick rules already identified in the index

2. Read `certifications/<cert>/questions.json` — filter to the question numbers listed for this domain in the index. Study the actual question stems and answer options to identify:
   - Recurring keyword patterns ("near real-time", "labeled data", "no labels", etc.)
   - Answer choices the exam favors
   - Distractor patterns (common wrong answers)
   - AWS service distinctions that appear repeatedly

## Output file

Write the guide to:
```
certifications/<cert>/theory/domain_<N>_<slug>.md
```

Where `<slug>` is a short lowercase kebab-case name derived from the domain title (e.g., `domain_2_generative-ai.md`).

If the file already exists and is NOT a placeholder (more than 10 lines of real content), ask the user whether to overwrite or append.

## Content structure (Spanish, Markdown)

Generate the following sections based on what is actually relevant for the domain. Skip or rename sections that don't apply.

```markdown
# D<N> · <Título del Dominio> (<peso>% del examen)

**<N> preguntas · Peso: <peso>%**

---

## 1. Conceptos Teóricos

[For each major concept group found in this domain:]
- Clear explanation of the concept
- How it works technically
- When/why it matters in the AWS context
- Comparison tables where the domain has multiple related services or techniques
- Common misconceptions or edge cases that appear in exam questions

## 2. Matriz de Servicios / Métricas

[One or more comparison tables covering the most-tested distinctions in this domain.
For D1: evaluation metrics table. For D2/D3: service comparison tables.
Include: definition, use case, when the exam prioritizes it.]

## 3. Patrones de Examen — Cheat Sheet

[Tables in format: "Palabra clave en el enunciado" → "Respuesta correcta"
One table per concept cluster (learning types, algorithms, services, metrics, etc.)]

---

_Guía generada el <YYYY-MM-DD> · Basada en <N> preguntas del banco oficial <cert-code>_
```

## Rules

- **All content must be in Spanish** — this is mandatory
- No greetings, no introductions outside the content block
- Depth proportional to concept frequency in the index (⭐⭐⭐⭐⭐ concepts get full treatment, ⭐⭐ concepts get a brief entry)
- Cheat sheet patterns must be derived from the actual questions — not invented
- Where the index already has "Reglas rápidas", include those verbatim and expand them with additional patterns found in the questions
- After writing the file, report: domain name, file path, number of sections written, and the top 3 concepts covered
