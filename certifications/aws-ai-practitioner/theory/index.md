# AWS Certified AI Practitioner (AIF-C01)

## Índice de Estudio - Análisis de 149 Preguntas del Banco Oficial

**Objetivo:** Identificar los conceptos y servicios más frecuentes por dominio para priorizar el estudio. **Fuente:** Banco oficial de 149 preguntas AIF-C01

## Distribución por Dominio

| **Dominio**                            | **Peso Oficial** | **Preguntas en Banco** | **Prioridad** |
| -------------------------------------- | ---------------- | ---------------------- | ------------- |
| D3 · Aplicaciones de Foundation Models | 28%              | 36 preguntas           | 🔴 Alta       |
| ---                                    | ---              | ---                    | ---           |
| D2 · Fundamentos de IA Generativa      | 24%              | 71 preguntas\*         | 🔴 Alta       |
| ---                                    | ---              | ---                    | ---           |
| D1 · Fundamentos de AI/ML              | 20%              | 26 preguntas           | 🟡 Media      |
| ---                                    | ---              | ---                    | ---           |
| D4 · IA Responsable                    | 14%              | 9 preguntas            | 🟡 Media      |
| ---                                    | ---              | ---                    | ---           |
| D5 · Seguridad y Gobernanza            | 14%              | 7 preguntas            | 🟡 Media      |
| ---                                    | ---              | ---                    | ---           |

\*D2 incluye muchas preguntas de Bedrock que se solapan con D3

## D1 · Fundamentos de AI/ML (20%)

**26 preguntas · Nums: 3, 4, 6, 8, 10, 11, 27, 36, 41, 43, 44, 56, 59, 62, 70, 72, 78, 84, 90, 91, 93, 100, 103, 109, 118, 138**

### Conceptos más frecuentes

| **Concepto**                                                    | **Frecuencia** | **Preguntas**         |
| --------------------------------------------------------------- | -------------- | --------------------- |
| Tipos de aprendizaje (supervised/unsupervised/reinforcement)    | ⭐⭐⭐⭐⭐     | 17, 58, 100, 116, 116 |
| ---                                                             | ---            | ---                   |
| Métricas de evaluación (Accuracy, RMSE, F1, Recall, Precision)  | ⭐⭐⭐⭐       | 4, 59, 96, 146        |
| ---                                                             | ---            | ---                   |
| Overfitting / Underfitting / Regularización                     | ⭐⭐⭐⭐       | 44, 109               |
| ---                                                             | ---            | ---                   |
| Pipeline ML (EDA, Feature Engineering, Hyperparameter Tuning)   | ⭐⭐⭐         | 72, 117               |
| ---                                                             | ---            | ---                   |
| SageMaker inference modes (Real-time, Async, Serverless, Batch) | ⭐⭐⭐⭐       | 6, 62                 |
| ---                                                             | ---            | ---                   |
| Algoritmos (K-means, k-NN, Decision Tree, Logistic Regression)  | ⭐⭐⭐         | 3, 103, 113, 138      |
| ---                                                             | ---            | ---                   |
| Transfer Learning                                               | ⭐⭐           | 7                     |
| ---                                                             | ---            | ---                   |
| Time Series / Forecasting                                       | ⭐⭐           | 93                    |
| ---                                                             | ---            | ---                   |
| SageMaker Feature Store                                         | ⭐⭐           | 11                    |
| ---                                                             | ---            | ---                   |
| Training vs Inference (conceptos básicos)                       | ⭐⭐           | 36, 41                |
| ---                                                             | ---            | ---                   |

### Reglas rápidas para el examen

- **Datos sin etiquetar + agrupar** → Unsupervised / K-means
- **Datos etiquetados + clasificar** → Supervised
- **Aprender por recompensas** → Reinforcement Learning
- **Buen train, mal test** → Overfitting → aumentar regularización
- **Grandes datasets offline sin urgencia** → Batch Transform
- **Payloads grandes con near real-time** → Asynchronous Inference
- **Tráfico esporádico ligero** → Serverless Inference
- **Tiempo real baja latencia** → Real-time Inference

## D2 · Fundamentos de IA Generativa (24%)

**71 preguntas · Mayor volumen del banco**

### Conceptos más frecuentes

| **Concepto**                                          | **Frecuencia** | **Preguntas clave**         |
| ----------------------------------------------------- | -------------- | --------------------------- |
| Amazon Bedrock (general)                              | ⭐⭐⭐⭐⭐     | 32, 38, 50, 61, 83, 131     |
| ---                                                   | ---            | ---                         |
| Prompt Engineering (few-shot, zero-shot, CoT)         | ⭐⭐⭐⭐⭐     | 5, 24, 25, 69, 75, 130, 133 |
| ---                                                   | ---            | ---                         |
| Temperatura / Parámetros de inferencia                | ⭐⭐⭐⭐⭐     | 65, 77, 139                 |
| ---                                                   | ---            | ---                         |
| RAG vs Fine-tuning vs Prompt Engineering              | ⭐⭐⭐⭐⭐     | 19, 46, 64, 98, 147, 150    |
| ---                                                   | ---            | ---                         |
| Tokens / Embeddings                                   | ⭐⭐⭐⭐       | 63, 82, 83, 110             |
| ---                                                   | ---            | ---                         |
| Alucinaciones (hallucinations)                        | ⭐⭐⭐⭐       | 77, 139                     |
| ---                                                   | ---            | ---                         |
| Fine-tuning en Bedrock                                | ⭐⭐⭐⭐       | 19, 50, 64, 81              |
| ---                                                   | ---            | ---                         |
| Métricas de evaluación GenAI (BLEU, ROUGE, BERTScore) | ⭐⭐⭐⭐       | 79, 96, 102, 106            |
| ---                                                   | ---            | ---                         |
| Foundation Models (conceptos)                         | ⭐⭐⭐         | 18, 23, 82                  |
| ---                                                   | ---            | ---                         |
| Amazon Q Developer                                    | ⭐⭐⭐         | 12, 74, 99                  |
| ---                                                   | ---            | ---                         |
| Bedrock Pricing (On-Demand vs Provisioned Throughput) | ⭐⭐⭐         | 32, 50, 83                  |
| ---                                                   | ---            | ---                         |
| Conversational AI / chatbots                          | ⭐⭐⭐         | 24, 42, 140                 |
| ---                                                   | ---            | ---                         |

### Reglas rápidas para el examen

- **Temperatura baja** → respuestas consistentes y deterministas
- **Temperatura alta** → respuestas creativas y variadas
- **Coste inferencia Bedrock** → número de tokens (input + output)
- **Datos propios sin reentrenar** → RAG / Knowledge Bases
- **Cambiar estilo/tono/vocabulario** → Fine-tuning
- **Actualizar conocimiento con datos nuevos frecuentes** → RAG
- **Evaluación de traducción** → BLEU
- **Evaluación de summarization** → ROUGE, BERTScore
- **Few-shot** → ejemplos en el propio prompt
- **Chain-of-thought** → "razona paso a paso"

## D3 · Aplicaciones de Foundation Models (28%)

**36 preguntas · Mayor peso en el examen**

### Conceptos más frecuentes

| **Concepto**                                  | **Frecuencia** | **Preguntas clave**  |
| --------------------------------------------- | -------------- | -------------------- |
| Bedrock Knowledge Bases (RAG gestionado)      | ⭐⭐⭐⭐⭐     | 38, 46, 98, 120, 147 |
| ---                                           | ---            | ---                  |
| Bedrock Guardrails                            | ⭐⭐⭐⭐       | 54, 67               |
| ---                                           | ---            | ---                  |
| Bedrock Agents                                | ⭐⭐⭐⭐       | 80, 120              |
| ---                                           | ---            | ---                  |
| SageMaker JumpStart                           | ⭐⭐⭐         | 33, 40               |
| ---                                           | ---            | ---                  |
| Amazon Comprehend                             | ⭐⭐⭐         | 45, 151              |
| ---                                           | ---            | ---                  |
| Amazon Textract                               | ⭐⭐⭐         | 68                   |
| ---                                           | ---            | ---                  |
| Amazon Transcribe                             | ⭐⭐⭐         | 16, 132              |
| ---                                           | ---            | ---                  |
| Amazon Translate                              | ⭐⭐           | 154                  |
| ---                                           | ---            | ---                  |
| Amazon Personalize                            | ⭐⭐⭐         | 127                  |
| ---                                           | ---            | ---                  |
| Amazon Rekognition                            | ⭐⭐           | 31                   |
| ---                                           | ---            | ---                  |
| Amazon Lex                                    | ⭐⭐           | 45                   |
| ---                                           | ---            | ---                  |
| Amazon Kendra                                 | ⭐⭐           | 127                  |
| ---                                           | ---            | ---                  |
| Amazon QuickSight Q                           | ⭐⭐           | 74                   |
| ---                                           | ---            | ---                  |
| SageMaker Model Cards                         | ⭐⭐           | 91, 153              |
| ---                                           | ---            | ---                  |
| SageMaker Model Monitor                       | ⭐⭐           | 152                  |
| ---                                           | ---            | ---                  |
| Bedrock invocation logging                    | ⭐⭐           | 61                   |
| ---                                           | ---            | ---                  |
| Bedrock custom model + Provisioned Throughput | ⭐⭐⭐         | 50                   |
| ---                                           | ---            | ---                  |
| SageMaker Canvas (no-code ML)                 | ⭐⭐           | 56                   |
| ---                                           | ---            | ---                  |
| Negative prompts (imagen)                     | ⭐⭐           | 107                  |
| ---                                           | ---            | ---                  |
| CFG Scale (Stable Diffusion)                  | ⭐             | 97                   |
| ---                                           | ---            | ---                  |

### Reglas rápidas para el examen

- **RAG gestionado con docs propios en S3** → Bedrock Knowledge Bases
- **Filtrar contenido / PII en GenAI** → Bedrock Guardrails
- **Agente que actúa en sistemas externos** → Bedrock Agents
- **Extraer texto de PDF/formulario** → Amazon Textract (no Rekognition)
- **Análisis de sentimiento / toxicidad en texto** → Amazon Comprehend
- **Speech-to-text** → Amazon Transcribe
- **Text-to-speech** → Amazon Polly
- **Traducción de idiomas** → Amazon Translate
- **Recomendaciones personalizadas** → Amazon Personalize
- **Búsqueda semántica en docs corporativos** → Amazon Kendra
- **Detección de objetos/caras en imágenes** → Amazon Rekognition
- **Documentar modelo para transparencia** → SageMaker Model Cards
- **Detectar drift en producción** → SageMaker Model Monitor
- **Custom model en Bedrock → activar** → Provisioned Throughput
- **No-code ML sin experiencia técnica** → SageMaker Canvas

## D4 · IA Responsable (14%)

**9 preguntas · Nums: 1, 37, 57, 94, 101, 123, 128, 148, 153**

### Conceptos más frecuentes

| **Concepto**                                                                 | **Frecuencia** | **Preguntas clave**       |
| ---------------------------------------------------------------------------- | -------------- | ------------------------- |
| Fairness / Bias en datos y modelos                                           | ⭐⭐⭐⭐⭐     | 37, 57, 94, 100, 124, 148 |
| ---                                                                          | ---            | ---                       |
| SageMaker Clarify (bias + explicabilidad)                                    | ⭐⭐⭐⭐       | 39, 43, 101               |
| ---                                                                          | ---            | ---                       |
| Dimensiones Responsible AI (fairness, explainability, privacy, transparency) | ⭐⭐⭐⭐       | 100, 148, 153             |
| ---                                                                          | ---            | ---                       |
| Tipos de bias (sampling, measurement, confirmation)                          | ⭐⭐⭐         | 57                        |
| ---                                                                          | ---            | ---                       |
| Human-in-the-loop                                                            | ⭐⭐⭐         | 8, 123                    |
| ---                                                                          | ---            | ---                       |
| Plagiarism / Toxicity / Privacy (retos GenAI)                                | ⭐⭐⭐         | 52                        |
| ---                                                                          | ---            | ---                       |
| Data residency                                                               | ⭐⭐           | 128                       |
| ---                                                                          | ---            | ---                       |
| EC2 Trn series (sostenibilidad)                                              | ⭐⭐           | 53                        |
| ---                                                                          | ---            | ---                       |
| PDPs (Partial Dependence Plots)                                              | ⭐⭐           | 1                         |
| ---                                                                          | ---            | ---                       |

### Reglas rápidas para el examen

- **Dataset no representativo de grupos** → Sampling bias
- **Detectar bias + explicabilidad** → SageMaker Clarify
- **Dataset no representativo → solución** → Diversificar datos + reentrenar
- **Post-processing para reducir bias/toxicidad** → Human-in-the-loop
- **Datos que no pueden salir del país** → Data residency
- **Entrenamiento con menor impacto ambiental** → EC2 Trn (Trainium)
- **Transparencia de modelo para stakeholders** → PDPs / Model Cards
- **Alumno copia de IA** → Plagiarism (no toxicity, no hallucination)

## D5 · Seguridad y Gobernanza (14%)

**7 preguntas · Nums: 13, 28, 30, 40, 95, 117, 149**

### Conceptos más frecuentes

| **Concepto**                                  | **Frecuencia** | **Preguntas clave** |
| --------------------------------------------- | -------------- | ------------------- |
| IAM Roles para Bedrock/SageMaker              | ⭐⭐⭐⭐⭐     | 9, 26, 34, 66, 87   |
| ---                                           | ---            | ---                 |
| Shared Responsibility Model en AI             | ⭐⭐⭐⭐       | 30, 87              |
| ---                                           | ---            | ---                 |
| AWS CloudTrail (auditoría de accesos)         | ⭐⭐⭐         | 26                  |
| ---                                           | ---            | ---                 |
| AWS KMS (cifrado con clave propia)            | ⭐⭐⭐         | 104                 |
| ---                                           | ---            | ---                 |
| AWS PrivateLink (Bedrock en VPC sin internet) | ⭐⭐⭐         | 13                  |
| ---                                           | ---            | ---                 |
| AWS Artifact (compliance reports)             | ⭐⭐           | 28                  |
| ---                                           | ---            | ---                 |
| AWS Audit Manager                             | ⭐⭐           | 149                 |
| ---                                           | ---            | ---                 |
| AWS Config (monitorizar configuraciones)      | ⭐⭐           | 149                 |
| ---                                           | ---            | ---                 |
| Jailbreak / Prompt Injection                  | ⭐⭐⭐         | 89, 95              |
| ---                                           | ---            | ---                 |
| SageMaker Network Isolation                   | ⭐⭐           | 90                  |
| ---                                           | ---            | ---                 |
| Amazon Macie (datos sensibles en S3)          | ⭐⭐           | 142                 |
| ---                                           | ---            | ---                 |

### Reglas rápidas para el examen

- **Cifrado con clave propia** → AWS KMS (no Macie, no Inspector, no Secrets Manager)
- **Credenciales / Secrets** → AWS Secrets Manager (no KMS)
- **Datos sensibles detectados en S3** → Amazon Macie
- **Auditoría de quién accedió a Bedrock** → AWS CloudTrail
- **Compliance reports de terceros** → AWS Artifact
- **Bedrock en VPC sin internet** → AWS PrivateLink
- **Saltarse restricciones de seguridad de un FM** → Jailbreak
- **Proteger prompt del sistema de exposición** → Adversarial prompting
- **Más control de seguridad = construir desde cero** → Generative AI Scoping Matrix D
- **Responsabilidad del cliente en Bedrock** → Datos en tránsito y en reposo

## Conceptos que más confunden en el examen

### Trampas frecuentes

| **Concepto A**    | **Concepto B**          | **Diferencia clave**                                                             |
| ----------------- | ----------------------- | -------------------------------------------------------------------------------- |
| SageMaker Clarify | SageMaker Model Monitor | Clarify = bias/explicabilidad. Monitor = drift en producción                     |
| ---               | ---                     | ---                                                                              |
| SageMaker Clarify | SageMaker Model Cards   | Clarify = técnico. Model Cards = documentación/transparencia                     |
| ---               | ---                     | ---                                                                              |
| Amazon Textract   | Amazon Rekognition      | Textract = documentos estructurados. Rekognition = imágenes/vídeo                |
| ---               | ---                     | ---                                                                              |
| Amazon Kendra     | Bedrock Knowledge Bases | Kendra = búsqueda semántica. Knowledge Bases = RAG con FM                        |
| ---               | ---                     | ---                                                                              |
| Amazon Kendra     | Amazon Q Business       | Q = asistente corporativo completo. Kendra = solo búsqueda                       |
| ---               | ---                     | ---                                                                              |
| Fine-tuning       | RAG                     | Fine-tuning = cambiar comportamiento/estilo. RAG = añadir datos actuales         |
| ---               | ---                     | ---                                                                              |
| Temperatura baja  | Temperatura alta        | Baja = consistente/determinista. Alta = creativa/variada                         |
| ---               | ---                     | ---                                                                              |
| AWS KMS           | AWS Secrets Manager     | KMS = claves de cifrado. Secrets Manager = contraseñas/API keys                  |
| ---               | ---                     | ---                                                                              |
| Amazon Transcribe | Amazon Polly            | Transcribe = audio→texto. Polly = texto→audio                                    |
| ---               | ---                     | ---                                                                              |
| Tokens            | Embeddings              | Tokens = unidades básicas input/output. Embeddings = vectores semánticos         |
| ---               | ---                     | ---                                                                              |
| BLEU              | ROUGE                   | BLEU = traducción. ROUGE = summarization                                         |
| ---               | ---                     | ---                                                                              |
| Sampling bias     | Measurement bias        | Sampling = datos no representativos. Measurement = datos mal medidos/etiquetados |
| ---               | ---                     | ---                                                                              |
| Supervised        | Active learning         | Supervised = datos etiquetados fijos. Active = pide más etiquetas iterativamente |
| ---               | ---                     | ---                                                                              |
| Batch Transform   | Asynchronous Inference  | Batch = offline masivo sin urgencia. Async = payloads grandes near real-time     |
| ---               | ---                     | ---                                                                              |

## Resumen: Top 20 conceptos por frecuencia absoluta

- **Amazon Bedrock** (general) - aparece en ~60% de las preguntas
- **RAG / Bedrock Knowledge Bases** - ~15 preguntas
- **Prompt Engineering** (few-shot, CoT, zero-shot) - ~12 preguntas
- **Temperatura y parámetros de inferencia** - ~8 preguntas
- **Fine-tuning vs RAG** - ~8 preguntas
- **SageMaker inference modes** - ~6 preguntas
- **IAM Roles / Seguridad** - ~6 preguntas
- **Tipos de aprendizaje ML** - ~6 preguntas
- **Métricas de evaluación ML** - ~6 preguntas
- **Bias y Responsible AI** - ~6 preguntas
- **SageMaker Clarify** - ~5 preguntas
- **Bedrock Guardrails** - ~4 preguntas
- **Bedrock Agents** - ~4 preguntas
- **Alucinaciones** - ~4 preguntas
- **Métricas evaluación GenAI (BLEU/ROUGE/BERTScore)** - ~4 preguntas
- **Amazon Comprehend** - ~4 preguntas
- **Tokens y Embeddings** - ~4 preguntas
- **SageMaker Model Cards/Monitor** - ~4 preguntas
- **AWS KMS / Cifrado** - ~3 preguntas
- **Jailbreak / Prompt Injection** - ~3 preguntas

_Documento generado el 2 de junio de 2026 · Banco: 149 preguntas oficiales AIF-C01_