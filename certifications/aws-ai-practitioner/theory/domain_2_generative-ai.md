# D2 · Fundamentos de IA Generativa (24% del examen)

**71 preguntas · Peso: 24% · Mayor volumen del banco**

---

## 1. Modelos Fundacionales y Arquitectura GenAI

### Arquitectura Transformer

Los Foundation Models (FMs) modernos se basan en la arquitectura **Transformer**, cuyo mecanismo central es la **atención** (attention):

- **Self-Attention**: permite que cada token "vea" todos los demás tokens del input simultáneamente, capturando dependencias de largo alcance sin limitaciones de distancia.
- **Multi-Head Attention**: aplica múltiples cabezas de atención en paralelo, cada una aprendiendo relaciones semánticas distintas (sujeto-verbo, entidad-contexto, etc.).
- **Encoder-Decoder vs Decoder-Only**:
  - *Encoder-only* (BERT): ideal para tareas de comprensión/clasificación.
  - *Decoder-only* (GPT, Claude, Titan): ideal para generación de texto.
  - *Encoder-Decoder* (T5, Bedrock Titan Text): traducciones y summarization.

### Embeddings

| Concepto | Definición | Cuándo el examen lo evalúa |
|---|---|---|
| **Embedding** | Representación numérica vectorial de palabras, frases o imágenes que captura significado semántico | "representaciones numéricas de objetos del mundo real" → siempre Embedding, no Token |
| **Vector store** | Base de datos optimizada para almacenar y consultar embeddings por similitud semántica | Amazon Aurora PostgreSQL, OpenSearch para RAG |
| **Embedding model** | Modelo especializado en convertir texto/imágenes a vectores | Bedrock Titan Embeddings |

> **Distinción examen (Q63):** "Representaciones numéricas de objetos reales que NLP usa para comprensión" → **Embeddings** (no Tokens).

### Tokens

| Concepto | Definición |
|---|---|
| **Token** | Unidad básica de input/output de un LLM (puede ser una palabra, subpalabra, carácter o símbolo) |
| **Tokenización** | Proceso de dividir el texto en tokens antes de procesarlo |
| **Coste en Bedrock** | Se cobra por **número de tokens** (input + output) — no por tiempo de CPU, tamaño del modelo ni temperatura |

> **Distinción examen (Q82):** Tokens = unidades básicas de input/output. Embeddings = representaciones matemáticas de significado. No confundir.

### Ventana de Contexto (Context Window)

- Define **cuánta información cabe en un único prompt** (texto de entrada + historial de conversación + instrucciones del sistema).
- Se mide en tokens.
- **Q23**: "¿Cómo saber cuánta información cabe en un prompt?" → **Context window** (no temperatura, no batch size, no model size).

### Tipos de Foundation Models por modalidad

| Tipo | Input | Output | Caso de uso |
|---|---|---|---|
| **Text generation** | Texto | Texto | Chatbots, summarization, Q&A |
| **Text embedding** | Texto | Vector | Búsqueda semántica, RAG |
| **Multi-modal embedding** | Texto + imágenes | Vector | Búsqueda con imágenes y texto |
| **Image generation** | Texto (prompt) | Imagen | Generación visual, variaciones |
| **Multi-modal generation** | Texto + imágenes | Texto/imágenes | Análisis visual + respuesta |

> **Q18**: Aplicación de búsqueda que maneja queries con texto **y** imágenes → **Multi-modal embedding model**.

---

## 2. Configuración de Parámetros de Inferencia

### Tabla completa de parámetros

| Parámetro | Qué controla | Rango típico | Para **creatividad/aleatoriedad** | Para **determinismo/precisión** |
|---|---|---|---|---|
| **Temperatura** | Distribución de probabilidad de los tokens candidatos. Valores altos aplanan la distribución (más variedad), valores bajos la agudizan (más concentrada). | 0.0 – 1.0 (o 2.0) | **Alta** (0.7 – 1.0) | **Baja** (0.0 – 0.3) |
| **Top-P** (nucleus sampling) | Selecciona el conjunto mínimo de tokens cuya probabilidad acumulada supera P. Limita candidatos por masa de probabilidad. | 0.0 – 1.0 | **Alto** (0.9 – 1.0) | **Bajo** (0.1 – 0.3) |
| **Top-K** | Selecciona los K tokens más probables en cada paso. Limita candidatos por número fijo. | 1 – 500 | **Alto** (40 – 500) | **Bajo** (1 – 5) |
| **Penalizaciones** (Repetition/Presence Penalty) | Reduce la probabilidad de repetir tokens o temas ya mencionados. | -2.0 – 2.0 | Penalización baja (0) | Penalización alta para evitar repetición |
| **Max Tokens** (Max New Tokens) | Límite máximo del output generado. **No afecta la calidad ni el determinismo.** | 1 – 4096+ | Sin efecto directo en estilo | Reducir limita respuestas largas |

### Regla clave del examen

```
Respuestas consistentes a mismo input → Temperatura BAJA (Q65)
Respuestas creativas / variadas       → Temperatura ALTA
Coste de inferencia en Bedrock        → Número de TOKENS (Q83)
```

> **Q65**: "La empresa necesita que el LLM produzca respuestas **más consistentes** al mismo prompt." → **Decrease the temperature value.**

> **Q24**: "Chatbot de soporte técnico necesita **respuestas deseadas**." → Experimentar y refinar el prompt (no aumentar temperatura).

---

## 3. Técnicas de Prompt Engineering

### Zero-Shot Prompting

- **Qué es**: enviar el prompt **sin ejemplos**; el modelo responde basándose únicamente en su conocimiento preentrenado.
- **Cuándo usar**: tareas generales donde el modelo ya sabe la estructura de la respuesta.
- **Señal en el enunciado**: "without any additional context or examples", "sin proporcionar ejemplos".

```
Prompt: "Clasifica el sentimiento de este texto como positivo o negativo: 'Me encantó el producto.'"
```

### Few-Shot Prompting

- **Qué es**: incluir **2–5 ejemplos de pares entrada/salida** dentro del propio prompt.
- **Cuándo usar**: clasificación con etiquetas específicas, formato de salida requerido, detección de intenciones (intent detection).
- **Señal en el enunciado**: "provide examples in the prompt", "few-shot learning", "examples of user messages and correct intents".

```
Prompt:
"Clasifica el sentimiento:
Texto: 'Excelente servicio.' → Positivo
Texto: 'Tardaron demasiado.' → Negativo
Texto: 'El producto llegó a tiempo.' → "
```

> **Q25**: Clasificar sentimientos positivo/negativo → incluir ejemplos con etiquetas en el prompt → **Few-shot**.

> **Q75**: Chatbot de detección de intenciones con few-shot → los ejemplos deben ser **pares de mensaje de usuario + intención correcta** (no pares de respuesta).

### Chain-of-Thought (CoT)

- **Qué es**: instruir al modelo para que **razone paso a paso** antes de dar la respuesta final.
- **Cuándo usar**: tareas de razonamiento complejo, matemáticas, problemas multi-paso.
- **Señal en el enunciado**: "step-by-step explanation", "complex problem-solving", "detailed reasoning".

```
Prompt: "Explica paso a paso cómo resolver este problema de inventario..."
```

> **Q131**: Tarea de "resolución de problemas complejos con razonamiento detallado paso a paso" → **Chain-of-thought prompting**.

### System Prompts (Role Description / Context)

- **Qué es**: instrucción fija que define el **rol, tono, restricciones o audiencia objetivo** del modelo, separada del mensaje del usuario.
- **Cuándo usar**: adaptar el estilo a distintas audiencias sin re-entrenar el modelo.
- **Señal en el enunciado**: "automatically change the style", "different age ranges", "role description in the prompt context".

```
System: "Eres un asistente educativo. Explica conceptos de forma sencilla para niños de 8 años."
User: "¿Qué es la fotosíntesis?"
```

> **Q69**: App educativa que necesita cambiar el **estilo de respuesta según la edad** del usuario → añadir **role description al prompt context** (no fine-tuning, no CoT).

### Resumen de técnicas

| Técnica | Señal clave en el enunciado | Respuesta correcta |
|---|---|---|
| Zero-shot | "sin ejemplos", "no additional context" | Zero-shot prompting |
| Few-shot | "ejemplos en el prompt", "pares de input/output" | Few-shot prompting |
| Chain-of-thought | "paso a paso", "razonamiento complejo", "step-by-step" | CoT prompting |
| System prompt | "cambiar estilo/tono", "adaptar a audiencia", "role description" | System prompt / role context |
| Prompt refinement | "chatbot que necesita respuestas correctas", "experimentar" | Refinar el prompt (Q24) |

---

## 4. RAG vs Fine-tuning vs Prompt Engineering

Esta es la decisión más evaluada en D2 (Q19, Q46, Q64, Q98, Q147, Q150). Dominar cuándo usar cada técnica es crítico.

### Tabla de decisión

| Técnica | Cuándo elegirla | Señal en el enunciado | Ejemplo de pregunta |
|---|---|---|---|
| **Prompt Engineering** | El modelo ya sabe la tarea, solo necesita instrucciones de formato/estilo | "output short", "in specific language", "adjust behavior with instructions" | Q5, Q24 |
| **RAG** | Necesita datos **actuales o privados** sin reentrenar; documentos propios en S3 | "company's own data", "real-time", "product manuals", "policy documents", "actualizar con datos frecuentes" | Q38, Q46, Q98 |
| **Fine-tuning** | Cambiar **estilo, tono, vocabulario especializado** o adaptar a terminología de dominio | "scientific terms", "specific vocabulary", "improve accuracy with labeled data", "domain adaptation" | Q19, Q64 |
| **Ongoing pre-training** | Mejorar el modelo **continuamente con nuevos datos** a lo largo del tiempo | "improve performance over time" | Q81 |

### Reglas críticas

```
Datos propios en S3/PDF sin reentrenar          → RAG / Bedrock Knowledge Bases (Q46)
Terminología científica / vocabulario específico → Fine-tuning con domain adaptation (Q64)
Cambiar estilo/formato/idioma de output         → Prompt Engineering (Q5)
Actualizar conocimiento con datos frecuentes    → RAG (no fine-tuning)
Custom model en Bedrock → para producción       → Provisioned Throughput (Q50)
```

### Fine-tuning en Bedrock — Formato requerido

> **Q19**: Para fine-tuning en Bedrock, el dataset debe tener formato `{"prompt": "...", "completion": "..."}` — **pares de prompt + completion en JSONL** (no .txt, no .csv, no journals genéricos).

---

## 5. Métricas de Evaluación GenAI

### Tabla de métricas

| Métrica | Tarea evaluada | Señal en el enunciado | Pregunta |
|---|---|---|---|
| **BLEU** (Bilingual Evaluation Understudy) | **Traducción** de texto | "translate training manuals", "translation quality" | Q79 |
| **ROUGE** (Recall-Oriented Understudy for Gisting Evaluation) | **Summarization** / coherencia de texto | "text coherence", "summarization evaluation", "foreign language app with text coherence" | Q106 |
| **BERTScore** | **Summarization** (más semántico que ROUGE) | "automatic model evaluation", "summarization quality with semantic similarity" | Q102 |
| **F1 Score** | Clasificación (help desk Q&A, intent detection) | "fine-tuned LLM for Q&A accuracy", "classification accuracy" | Q96 |
| **RMSE** | Regresión (predicción numérica) | "error de predicción continua" | — |

### Regla clave del examen

```
Traducción      → BLEU
Summarization   → ROUGE o BERTScore
Clasificación   → F1 Score
Regresión       → RMSE
```

> **Q79**: "Traducir manuales de inglés a otros idiomas" → **BLEU**.

> **Q102**: "Evaluación automática de summarization en Bedrock" → **BERTScore**.

> **Q106**: "App de idiomas que mejora coherencia de texto" → **ROUGE score**.

> **Q96**: "Fine-tuned LLM para help desk, medir accuracy" → **F1 score**.

---

## 6. Amazon Bedrock — Conceptos Clave

### Modelo de Precios

| Modalidad | Cuándo elegir | Señal en el enunciado |
|---|---|---|
| **On-Demand** | Budget limitado, sin compromiso, flexibilidad, pruebas | "limited budget", "flexibility without long-term commitment", "paga por uso" |
| **Provisioned Throughput** | Throughput garantizado para **custom models** o carga predecible alta | "custom model", "activate fine-tuned model in production" |
| **Batch Inference** | Procesar grandes volúmenes sin urgencia | "offline batch", "large datasets" |

> **Q32**: Empresa con budget limitado y sin compromiso → **On-Demand**.

> **Q50**: Custom model entrenado en Bedrock → para usarlo en producción → **Provisioned Throughput obligatorio**.

### Bedrock Knowledge Bases (RAG gestionado)

- Conecta el FM con documentos propios almacenados en S3.
- Gestiona automáticamente: chunking, embedding, vector store y retrieval.
- **Q38**: "Supplement el modelo con datos privados de la empresa" → **Create a Bedrock knowledge base**.
- **Q46**: "Chat interface para PDF manuals" → **Upload PDFs to Bedrock knowledge base**.

### Invocation Logging

- **Q61**: Para monitorizar input/output del modelo → **Enable invocation logging in Amazon Bedrock** (no CloudTrail, no Audit Manager, no EventBridge).

### Alucinaciones (Hallucinations)

- **Definición**: el modelo genera contenido que **suena plausible y factual pero es incorrecto**.
- No confundir con: Data leakage (exposición de datos), Overfitting (memorización), Underfitting (generalización pobre).
- **Q77**: Contenido de marketing "plausible y factual pero incorrecto" → **Hallucination**.

---

## 7. Amazon Q — Variantes y Casos de Uso

| Servicio | Para qué sirve | Señal en el enunciado |
|---|---|---|
| **Amazon Q Developer** | Asistente de código: generar snippets, rastrear referencias, verificar licencias open-source | "developer productivity", "code snippets", "open source license tracking", "AWS Glue sin experiencia" |
| **Amazon Q in QuickSight** | Generación automática de **gráficos y dashboards** por lenguaje natural | "display total sales", "generate graphs", "retail locations data visualization" |
| **Amazon Q Business** | Asistente corporativo completo (buscar en documentos internos, políticas, etc.) | "enterprise assistant", "buscar en sistemas internos" |
| **Amazon Q in AWS Chatbot** | Responder preguntas sobre estado de servicios AWS en Slack/Teams | "AWS operations status" |

> **Q74**: "Mostrar ventas totales de productos en distintas ubicaciones de retail" → **Amazon Q in Amazon QuickSight**.

> **Q12**: "Aumentar productividad de desarrolladores" → **Amazon Q Developer** (code snippets + license tracking).

> **Q99**: "Usar AWS Glue con poca experiencia de programación" → **Amazon Q Developer**.

---

## 8. Patrones de Examen — Cheat Sheet Completo

### Prompt Engineering

| Palabra clave en el enunciado | Respuesta correcta |
|---|---|
| "Outputs cortos en idioma específico" | Ajustar el prompt (prompt engineering) |
| "Respuestas consistentes al mismo input" | Decrease temperature |
| "Respuestas creativas / variadas" | Increase temperature |
| "Ejemplos de input/output en el prompt" | Few-shot prompting |
| "Sin ejemplos adicionales" | Zero-shot prompting |
| "Razonamiento paso a paso / complejo" | Chain-of-thought prompting |
| "Cambiar estilo según audiencia / edad" | System prompt / role description |
| "Chatbot necesita respuestas correctas → iteración" | Refinar / experimentar el prompt |
| "Detección de intenciones con few-shot" | Pares usuario+intención (no usuario+respuesta) |

### RAG vs Fine-tuning

| Palabra clave en el enunciado | Respuesta correcta |
|---|---|
| "Datos propios privados sin reentrenar" | RAG / Bedrock Knowledge Bases |
| "PDF manuals, policy documents, S3" | RAG / Bedrock Knowledge Bases |
| "Actualizar con datos frecuentes/nuevos" | RAG |
| "Terminología científica / vocabulario de dominio" | Fine-tuning (domain adaptation) |
| "Cambiar estilo o tono del modelo" | Fine-tuning |
| "Labeled data con prompt/completion field" | Fine-tuning en Bedrock |
| "Mejorar rendimiento del modelo con el tiempo" | Ongoing pre-training |

### Tokens, Embeddings y Costes

| Palabra clave en el enunciado | Respuesta correcta |
|---|---|
| "Representaciones numéricas de objetos reales" | Embeddings |
| "Unidades básicas de input/output del LLM" | Tokens |
| "Cuánta información cabe en un prompt" | Context window |
| "Coste de inferencia en Bedrock" | Número de tokens (input + output) |
| "Almacenar y consultar embeddings de conversaciones" | Vector DB (Aurora PostgreSQL) |
| "Búsqueda con texto E imágenes" | Multi-modal embedding model |

### Métricas GenAI

| Palabra clave en el enunciado | Respuesta correcta |
|---|---|
| "Traducción de idiomas" | BLEU |
| "Summarization / coherencia de texto" | ROUGE |
| "Automatic model evaluation en Bedrock para summarization" | BERTScore |
| "Accuracy de LLM fine-tuned para clasificación/Q&A" | F1 Score |
| "Predicción de error numérico continuo" | RMSE |

### Bedrock y Amazon Q

| Palabra clave en el enunciado | Respuesta correcta |
|---|---|
| "Budget limitado, sin compromiso, flexibilidad" | On-Demand (Bedrock) |
| "Custom model en producción" | Provisioned Throughput (obligatorio) |
| "Monitorizar logs input/output del FM" | Enable invocation logging en Bedrock |
| "Content plausible pero incorrecto" | Hallucination (alucinación) |
| "Developer productivity, code, licencias open-source" | Amazon Q Developer |
| "Gráficos y dashboards de ventas / datos" | Amazon Q in QuickSight |
| "Asistente corporativo completo con docs internos" | Amazon Q Business |

### AI Governance

| Palabra clave en el enunciado | Respuesta correcta |
|---|---|
| "Políticas y guías para datos, transparencia, compliance" | AI governance framework |
| "Alinear con estándares, revenue goals, stakeholders" | AI governance framework |

---

_Guía generada el 2026-06-02 · Basada en 36 preguntas clave del banco oficial AIF-C01 (D2 · 24%)_
