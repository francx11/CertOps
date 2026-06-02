# D4 · IA Responsable (14% del examen)

**9 preguntas · Peso: 14% · Nums: 1, 37, 57, 94, 101, 123, 128, 148, 153**

---

## 1. Pilares de IA Responsable en AWS

AWS define la IA Responsable sobre seis dimensiones evaluadas en el examen:

| **Dimensión**         | **Definición**                                                                                       | **Frecuencia examen** |
| --------------------- | ---------------------------------------------------------------------------------------------------- | --------------------- |
| **Fairness**          | El modelo no debe tratar grupos demográficos de forma desigual ni perpetuar sesgos históricos        | ⭐⭐⭐⭐⭐             |
| **Explainability**    | Capacidad de entender y comunicar POR QUÉ el modelo toma cada decisión                              | ⭐⭐⭐⭐               |
| **Privacy**           | Proteger datos personales y sensibles en entrenamiento e inferencia                                  | ⭐⭐⭐                 |
| **Transparency**      | Documentar cómo funciona el modelo, sus limitaciones y su comportamiento esperado para stakeholders  | ⭐⭐⭐⭐               |
| **Robustness**        | El modelo debe resistir ataques adversariales y datos fuera de distribución                          | ⭐⭐                   |
| **Governance**        | Supervisión humana, trazabilidad de decisiones y cumplimiento normativo                              | ⭐⭐⭐                 |

### 1.1 Equidad (Fairness) y Tipos de Sesgo

El sesgo puede introducirse en cualquier etapa del pipeline ML:

| **Tipo de sesgo**      | **Causa**                                                                              | **Ejemplo del examen**                                                                      |
| ---------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Sampling bias**      | El conjunto de entrenamiento no representa a todos los grupos de la población          | Cámara de seguridad que marca desproporcionalmente a una etnia → datos históricos sesgados  |
| **Measurement bias**   | Los datos están mal medidos o etiquetados de forma inconsistente entre grupos          | Diferentes estándares de etiquetado para distintos grupos                                   |
| **Confirmation bias**  | El analista selecciona o pondera datos que confirman sus suposiciones previas           | Investigador que solo incluye estudios que apoyan su hipótesis                              |
| **Observer bias**      | El observador que recoge los datos influye inconscientemente en el resultado            | Entrevistador que formula preguntas de forma diferente según el entrevistado                |

> **Regla de oro del examen:** Si el modelo falla desproporcionalmente con una etnia, género o grupo → **Sampling bias** (datos no representativos), NO measurement ni observer.

### 1.2 Soluciones para Mitigar el Sesgo

Jerarquía de soluciones según coste y efectividad:

| **Solución**                                           | **Cuándo usar**                                                         | **Coste**       |
| ------------------------------------------------------ | ----------------------------------------------------------------------- | --------------- |
| Diversificar datos + reentrenar fine-tuned model       | Modelo fine-tuned con bias demográfico detectado                        | Bajo (más rápido) |
| Data augmentation para clases desbalanceadas           | Dataset con clases subrepresentadas que generan imágenes/outputs sesgados | Bajo             |
| Medir class imbalance + adaptar proceso de entrenamiento | Pipeline ML clásico (loan approval, clasificación)                      | Bajo-Medio       |
| Pre-entrenar nuevo LLM desde cero con datos diversos   | Solo si el modelo base tiene sesgo estructural irrecuperable             | Muy alto         |

> **Trampa frecuente:** RAG **no** corrige el sesgo de un modelo ya entrenado — RAG añade conocimiento externo pero no cambia el comportamiento discriminatorio aprendido.

### 1.3 Explicabilidad (Explainability) — Capas

La explicabilidad se organiza en tres capas según cuándo actúa y qué audiencia sirve:

**Capa 1 — Explicabilidad Intrínseca (por diseño del modelo)**

El modelo ES explicable por su propia arquitectura, sin herramientas externas:

| **Técnica**             | **Cómo explica**                                                              | **Trigger del examen**                                      |
| ----------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **Decision Trees**      | Árbol de decisiones visible — cada nodo muestra la regla aplicada             | "Documenta su mecanismo interno directamente" → Decision Trees |
| **Linear Regression**   | Coeficientes = importancia directa de cada variable                           | Modelo explicable para relaciones lineales                  |
| **Logistic Regression** | Probabilidades directamente interpretables                                    | Clasificación binaria explicable                            |

**Capa 2 — Explicabilidad Post-hoc Global (comportamiento general del modelo)**

Herramientas que analizan el comportamiento del modelo sobre el conjunto de datos completo:

| **Técnica**                       | **Qué muestra**                                                               | **Audiencia**               |
| --------------------------------- | ----------------------------------------------------------------------------- | --------------------------- |
| **Partial Dependence Plots (PDPs)** | Cómo afecta una característica concreta a la predicción promedio del modelo | Stakeholders de negocio     |
| **Feature Importance**            | Ranking de variables por influencia total en el modelo                        | Equipos técnicos, compliance |

**Capa 3 — Explicabilidad Post-hoc Local (predicción individual)**

Herramientas que explican por qué el modelo tomó UNA decisión concreta:

| **Técnica** | **Qué muestra**                                                                 | **Audiencia**              |
| ----------- | ------------------------------------------------------------------------------- | -------------------------- |
| **SHAP**    | Contribución de cada feature a la predicción individual (valores Shapley)       | Técnicos, auditores        |
| **LIME**    | Aproximación local lineal para explicar predicción de caja negra en un punto    | Técnicos                   |

> **Regla del examen:**
> - "Stakeholders de negocio necesitan entender impacto de variables" → **PDPs** (global, visual)
> - "Auditor necesita saber por qué se rechazó ESTE préstamo concreto" → **SHAP** (local, individual)
> - "Algoritmo que documenta su mecanismo interno" → **Decision Trees** (intrínseco)
> - "Detectar bias + explicar predicciones automáticamente" → **SageMaker Clarify** (usa SHAP internamente)

### 1.4 Riesgos Legales del Uso de IA

El examen evalúa la capacidad de identificar qué tipo de riesgo legal genera cada problema de IA:

| **Riesgo Legal**                        | **Descripción**                                                                                     | **Ejemplo**                                                                 |
| --------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **Infracción de Propiedad Intelectual (IP)** | El modelo reproduce en sus outputs contenido protegido por copyright de los datos de entrenamiento | FM genera código idéntico a librerías propietarias o texto de artículos pagados |
| **Salidas sesgadas (discriminación)**   | Outputs que tratan grupos demográficos de forma desigual → responsabilidad legal por discriminación | Modelo de RRHH rechaza candidatos de una etnia; modelo de crédito penaliza género |
| **Riesgo para el usuario final**        | Decisiones automatizadas con impacto directo en personas sin supervisión humana adecuada            | Diagnóstico médico erróneo, denegación de crédito, contratación automatizada    |
| **Alucinaciones con consecuencias legales** | El modelo genera información falsa presentada con confianza → daño a terceros o responsabilidad civil | FM afirma que un medicamento es seguro cuando no lo es; datos financieros incorrectos |

> **Regla del examen:** Plagiarismo = reproducción de contenido real (IP). Alucinación = invención con confianza (no es copia). Son riesgos distintos.

> **Mitigación de riesgos legales en AWS:** Bedrock Guardrails (filtra IP y contenido) + SageMaker Clarify (detecta salidas sesgadas) + Human-in-the-loop A2I (supervisa decisiones críticas al usuario final) + RAG con fuentes verificadas (reduce alucinaciones).

### 1.5 Datos Responsables

Un dato es responsable cuando cumple estas propiedades antes de usarse para entrenar:

| **Propiedad**              | **Descripción**                                                                                     | **Consecuencia si falla**                               |
| -------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **Inclusividad**           | El dataset representa todos los grupos demográficos relevantes de forma equitativa                  | Sampling bias → modelo discriminatorio                  |
| **Curación de fuentes**    | Validar origen, licencias y calidad de los datos antes de incluirlos                               | IP infringement + datos contaminados con ruido/bias     |
| **Balanceo del dataset**   | Clases/grupos deben estar equilibrados; corregir desequilibrios con oversampling, SMOTE o augmentation | Class imbalance → modelo sesgado hacia clase mayoritaria |
| **Evitar overfitting**     | El modelo memoriza el training set y no generaliza → falla con datos nuevos en producción           | Alta accuracy en train, baja en test → modelo inútil    |
| **Evitar underfitting**    | El modelo es demasiado simple → no captura patrones del dominio → accuracy baja en train y test     | Modelo que no aprende nada útil del dataset             |

**Overfitting vs Underfitting — diferencia clave del examen:**

| **Problema**       | **Train accuracy** | **Test accuracy** | **Causa**                             | **Solución**                                 |
| ------------------ | ------------------ | ----------------- | ------------------------------------- | -------------------------------------------- |
| **Overfitting**    | Alta               | Baja              | Modelo demasiado complejo, poco datos | Regularización, dropout, más datos, early stopping |
| **Underfitting**   | Baja               | Baja              | Modelo demasiado simple               | Más features, modelo más complejo, más épocas |
| **Bien ajustado**  | Alta               | Alta              | Balance correcto                      | —                                            |

> **Trampa del examen:** Overfitting no es un problema de sesgo — es un problema de generalización. Underfitting tampoco es bias — es falta de capacidad del modelo.

### 1.6 Control de Alucinaciones y Toxicidad

| **Problema**      | **Descripción**                                                                      | **Solución AWS**                                    |
| ----------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------- |
| Alucinaciones     | El modelo genera información incorrecta pero presentada con confianza                | RAG (grounding con datos reales), temperatura baja  |
| Toxicidad         | Contenido dañino, ofensivo o inapropiado generado por el FM                          | Bedrock Guardrails (filtros de contenido)           |
| PII en outputs    | El modelo expone datos personales identificables en sus respuestas                   | Bedrock Guardrails (filtrado PII)                   |
| Plagiarismo       | El modelo reproduce contenido con copyright de sus datos de entrenamiento            | Categoría propia — no confundir con toxicidad       |
| Prompt injection  | Atacante manipula el prompt para saltarse las instrucciones del sistema               | Bedrock Guardrails, instrucciones defensivas        |

### 1.7 Human-in-the-Loop

Mecanismo que introduce supervisión humana en el pipeline de decisiones de IA:
- **SageMaker Augmented AI (A2I):** Servicio AWS para flujos de revisión humana automatizados
- Aplicación: cuando el modelo tiene baja confianza en una predicción, la tarea se enruta a un revisor humano
- En el examen: "post-processing para reducir bias/toxicidad en outputs críticos" → **Human-in-the-loop**

---

## 2. Herramientas de AWS para IA Responsable

### 2.1 Amazon SageMaker Clarify

Herramienta técnica de SageMaker para **detectar sesgo** y generar **explicaciones de predicciones**.

**Capacidades:**

| **Función**                        | **Detalle**                                                                                       |
| ---------------------------------- | ------------------------------------------------------------------------------------------------- |
| Pre-training bias detection        | Analiza el dataset ANTES de entrenar — detecta desequilibrios en clases/grupos                    |
| Post-training bias detection       | Evalúa el modelo entrenado para detectar disparidad en accuracy entre grupos                      |
| Feature importance (SHAP)         | Calcula qué variables influyen más en cada predicción individual                                  |
| Explainability reports             | Genera informes de explicabilidad consumibles por equipos de compliance                           |
| Integración con SageMaker Pipeline | Se integra nativamente en pipelines de entrenamiento y monitorización                             |

**Casos de uso del examen:**
- "Detectar bias + explicar predicciones" → **SageMaker Clarify** (no Data Wrangler, no Model Cards)
- "Entender por qué el modelo aprobó/rechazó un préstamo" → **SageMaker Clarify** (SHAP)
- "Asegurar fairness antes de desplegar modelo en producción" → **SageMaker Clarify**

### 2.2 Amazon Bedrock Guardrails

Capa de seguridad en tiempo real sobre los Foundation Models en Bedrock. Actúa tanto en el **input (prompt)** como en el **output (respuesta)**.

**Capacidades:**

| **Función**                     | **Detalle**                                                                                  |
| ------------------------------- | -------------------------------------------------------------------------------------------- |
| Filtrado de contenido           | Bloquea categorías de contenido: odio, violencia, sexual, insultos — configurable por nivel  |
| Filtrado de PII                 | Detecta y enmascara/bloquea información personal (nombres, emails, DNI, tarjetas)            |
| Palabras y frases prohibidas    | Lista de términos personalizada que nunca deben aparecer en inputs/outputs                   |
| Grounded responses (RAG)        | Verifica que las respuestas del FM estén ancladas en la fuente de conocimiento provista       |
| Filtrado de temas denegados     | Lista de temas sobre los que el FM no debe responder (e.g., competencia, temas legales)      |
| Prompt attack detection         | Detecta intentos de prompt injection y jailbreak                                             |

**Casos de uso del examen:**
- "Evitar que el FM revele PII de usuarios" → **Bedrock Guardrails**
- "Bloquear respuestas tóxicas/inapropiadas en producción" → **Bedrock Guardrails**
- "Prevenir que usuarios escalen a temas fuera del scope" → **Bedrock Guardrails** (temas denegados)
- "Proteger contra jailbreak/prompt injection" → **Bedrock Guardrails**

### 2.3 SageMaker Model Cards

Documentación estandarizada de un modelo para **transparencia hacia stakeholders**.

- Contiene: propósito del modelo, datos de entrenamiento, métricas de evaluación, limitaciones conocidas, consideraciones éticas
- Audiencia: equipos de compliance, auditores externos, product owners
- **No** genera explicaciones técnicas de predicciones individuales — eso es Clarify

### 2.4 Tabla Comparativa: Guardrails vs Clarify vs Model Cards

| **Criterio**                              | **Bedrock Guardrails**                      | **SageMaker Clarify**                           | **SageMaker Model Cards**                     |
| ----------------------------------------- | ------------------------------------------- | ----------------------------------------------- | --------------------------------------------- |
| **Capa de actuación**                     | Tiempo real (inferencia)                    | Training / Post-training / Monitoring           | Documentación (offline)                       |
| **Problema que resuelve**                 | Contenido dañino, PII, topics no permitidos | Sesgo en datos/modelo, explicabilidad           | Transparencia para stakeholders               |
| **Output principal**                      | Respuestas filtradas / bloqueadas           | Bias reports, SHAP values, feature importance   | Documento de modelo (PDF/JSON)                |
| **Requiere SageMaker**                    | No (funciona con Bedrock FMs)               | Sí (integrado en SageMaker)                     | Sí (integrado en SageMaker)                   |
| **Modelos objetivo**                      | Foundation Models en Bedrock                | Modelos ML clásicos y FMs fine-tuned            | Cualquier modelo documentado                  |
| **Trigger del examen**                    | "filtrar", "bloquear", "PII", "toxicidad"  | "detectar bias", "explicar predicción"          | "transparencia", "documentar", "stakeholders" |
| **Diferencia clave vs similar**           | vs Clarify: actúa en runtime, no en training | vs Model Cards: técnico, no documentación        | vs Clarify: documentación, no análisis técnico |

---

## 3. Otros Conceptos de D4

### 3.1 Sostenibilidad e Impacto Ambiental

- **EC2 Trn (Trainium):** Chip de AWS diseñado para entrenamiento de ML con menor consumo energético
- En el examen: "reducir huella de carbono / impacto ambiental del entrenamiento" → **EC2 Trn / Trainium**
- Complemento: AWS ofrece herramientas de estimación de huella de CO₂ en la consola

### 3.2 Data Residency (Residencia de Datos)

- Restricción legal/regulatoria que impide que los datos salgan de un país o región
- En AWS: selección de región específica + políticas IAM que restrinjan transferencias cross-region
- En el examen: "datos que no pueden salir del país" → **Data residency** + configuración de región

### 3.3 Chain-of-Thought Prompting (relevante para D4 → reducir alucinaciones)

- Técnica: instruir al modelo a explicar su razonamiento paso a paso antes de dar la respuesta final
- Frase tipo del examen: *"Ask the model to show its work by explaining its reasoning step by step"*
- Esto es **Chain-of-thought prompting** — no few-shot, no prompt injection, no templating
- Beneficio para IA responsable: mejora la explicabilidad y reduce errores de razonamiento

---

## 4. Patrones de Examen — Cheat Sheet

### 4.1 Identificar el Tipo de Sesgo

| **Enunciado del problema**                                                     | **Respuesta correcta**         |
| ------------------------------------------------------------------------------ | ------------------------------ |
| Modelo falla desproporcionalmente con una etnia / género / grupo               | **Sampling bias**              |
| Datos mal medidos o etiquetados de forma inconsistente                         | **Measurement bias**           |
| Analista selecciona datos que confirman sus hipótesis                          | **Confirmation bias**          |
| Observador influye inconscientemente en la recogida de datos                  | **Observer bias**              |

### 4.2 Solucionar el Sesgo

| **Enunciado del problema**                                                         | **Respuesta correcta**                                              |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Modelo genera imágenes con sesgo porque input data es biased                       | **Data augmentation para imbalanced classes** (no RAG, no Monitor) |
| LLM fine-tuned aprueba préstamos más rápido para un grupo demográfico              | **Incluir datos más diversos + fine-tune de nuevo** (más barato)    |
| Sistema ML de préstamos necesita ser unbiased antes de desplegar                  | **Medir class imbalance + adaptar proceso de entrenamiento**        |
| Bias demográfico severo en modelo base (no fine-tuned)                            | **Pre-entrenar nuevo LLM con datos diversos** (último recurso)      |

### 4.3 Elegir la Herramienta Correcta

| **Enunciado del problema**                                                              | **Respuesta correcta**              |
| --------------------------------------------------------------------------------------- | ----------------------------------- |
| Detectar sesgo en modelo ML + explicar predicciones individuales                        | **SageMaker Clarify**               |
| Transparencia y explicabilidad para stakeholders de negocio en informe formal           | **SageMaker Model Cards** + PDPs    |
| Filtrar contenido tóxico / PII en respuestas de FM en tiempo real                      | **Bedrock Guardrails**              |
| Evitar que FM responda sobre temas fuera de scope del negocio                           | **Bedrock Guardrails** (denied topics) |
| Proteger contra jailbreak / prompt injection en producción                              | **Bedrock Guardrails**              |
| Post-processing humano para decisiones críticas con alta incertidumbre                 | **Human-in-the-loop (SageMaker A2I)** |
| Reducir huella de carbono del entrenamiento ML                                          | **EC2 Trn (Trainium)**              |
| Datos que no pueden salir de un país concreto                                           | **Data residency** + región AWS     |
| Que el modelo explique paso a paso su razonamiento                                     | **Chain-of-thought prompting**      |

### 4.4 Explicabilidad: Elegir el Método Correcto

| **Enunciado del problema**                                                          | **Respuesta correcta**                      |
| ----------------------------------------------------------------------------------- | ------------------------------------------- |
| Informe de transparencia para stakeholders que muestre cómo variables afectan output | **Partial Dependence Plots (PDPs)** — global |
| Por qué el modelo rechazó ESTE préstamo concreto (predicción individual)            | **SHAP** — local/individual                 |
| Algoritmo que "documenta su mecanismo interno" para clasificación                   | **Decision Trees** — intrínseco             |
| Detectar bias + explicar predicciones automáticamente                               | **SageMaker Clarify** (usa SHAP internamente) |
| Documentar modelo formalmente para auditores/compliance                             | **SageMaker Model Cards**                   |

### 4.5 Riesgos Legales: Identificar el Tipo Correcto

| **Enunciado del problema**                                                         | **Riesgo legal**                             |
| ---------------------------------------------------------------------------------- | -------------------------------------------- |
| FM reproduce texto de un artículo de pago en sus respuestas                       | **Infracción de IP (copyright)**             |
| Modelo de contratación rechaza sistemáticamente candidatos de una etnia           | **Salida sesgada / discriminación**          |
| Sistema médico automatizado diagnostica sin revisión humana y comete error        | **Riesgo para el usuario final**             |
| FM afirma con confianza que un medicamento no tiene efectos secundarios (incorrecto) | **Alucinación con consecuencias legales**   |
| FM genera código idéntico a una librería propietaria                              | **Infracción de IP** (no es alucinación)     |

### 4.6 Datos Responsables: Identificar el Problema

| **Enunciado del problema**                                                         | **Problema / Solución**                            |
| ---------------------------------------------------------------------------------- | -------------------------------------------------- |
| Dataset con 90% imágenes de un grupo demográfico y 10% de otro                    | **Falta balanceo** → data augmentation / SMOTE     |
| Datos scrapeados de webs sin verificar licencias                                  | **Falta curación de fuentes** → riesgo de IP       |
| Modelo tiene 98% accuracy en train pero 60% en producción                         | **Overfitting** → regularización / más datos       |
| Modelo tiene 55% accuracy tanto en train como en test                             | **Underfitting** → modelo más complejo / más épocas |
| Modelo funciona bien para hombres pero mal para mujeres                           | **Falta inclusividad** → diversificar dataset      |

### 4.7 Trampas Frecuentes en D4

| **Concepto A**              | **Concepto B**              | **Diferencia clave**                                              |
| --------------------------- | --------------------------- | ----------------------------------------------------------------- |
| SageMaker Clarify           | SageMaker Model Cards       | Clarify = análisis técnico. Model Cards = documentación formal    |
| SageMaker Clarify           | SageMaker Data Wrangler     | Clarify = bias/explicabilidad. Data Wrangler = prep de datos      |
| Bedrock Guardrails          | SageMaker Clarify           | Guardrails = runtime (inferencia). Clarify = training/offline     |
| Data augmentation           | RAG                         | Data augm = corrige bias en entrenamiento. RAG = añade conocimiento |
| Fine-tune nuevo             | Pre-entrenar nuevo LLM      | Fine-tune = más barato/rápido. Pre-entrenar = último recurso      |
| Plagiarismo                 | Alucinación                 | Plagiarismo = copia real. Alucinación = invención con confianza   |
| Plagiarismo                 | Toxicidad                   | Plagiarismo = copyright. Toxicidad = contenido dañino             |
| Overfitting                 | Sampling bias               | Overfitting = memoriza train, no generaliza. Bias = discrimina grupos |
| Overfitting                 | Underfitting                | Overfitting: alta train / baja test. Underfitting: baja en ambas  |
| SHAP (local)                | PDPs (global)               | SHAP explica UNA predicción. PDPs explican tendencia general      |
| Explicabilidad intrínseca   | Post-hoc                    | Intrínseca = el modelo ya es explicable (Decision Trees). Post-hoc = herramienta externa (SHAP, PDPs) |
| Riesgo IP                   | Alucinación legal           | IP = reproducción de contenido real. Alucinación = info inventada |

---

_Guía generada el 2026-06-02 · Basada en 8 preguntas del banco oficial AIF-C01 · Dominio 4: IA Responsable (14%)_
