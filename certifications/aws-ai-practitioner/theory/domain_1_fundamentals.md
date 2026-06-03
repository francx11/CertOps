# D1 · Fundamentos de AI/ML (20% del examen)

**26 preguntas · Peso: 20%**

---

## 1. Conceptos Teóricos de IA/ML

### Tipos de Aprendizaje

#### Aprendizaje Supervisado (Supervised Learning)

El modelo aprende a partir de datos **etiquetados** (pares entrada→salida). El objetivo es generalizar la función que mapea entradas a salidas.

**Cuándo aparece en el examen:**
- "Datos etiquetados disponibles" → Supervised
- "Clasificar imágenes/texto con ejemplos previos" → Supervised
- "Predecir un valor numérico continuo" → Regresión (supervisado)

**Subtypes:**
- **Clasificación**: salida es una categoría discreta (spam/no spam, enfermedad sí/no)
- **Regresión**: salida es un valor continuo (precio de casa, temperatura)

**Algoritmos clave:**
| Algoritmo | Tipo | Interpretable |
|-----------|------|---------------|
| Decision Tree | Clasificación/Regresión | ✅ Sí — el examen pregunta esto |
| Logistic Regression | Clasificación binaria | ✅ Sí |
| k-NN (k-Nearest Neighbors) | Clasificación/Regresión | Parcial |
| Linear Regression | Regresión | ✅ Sí |
| Random Forest | Clasificación/Regresión | ❌ No |
| Neural Networks | Ambos | ❌ No (caja negra) |

> **Trampa del examen:** "Documentar cómo el mecanismo interno afecta la salida" → **Decision Tree** (no Neural Networks). Los árboles son interpretables por diseño.

---

#### Aprendizaje No Supervisado (Unsupervised Learning)

El modelo trabaja con datos **sin etiquetar**. Busca estructura, patrones o agrupaciones inherentes en los datos.

**Cuándo aparece en el examen:**
- "Datos sin etiquetas" → Unsupervised
- "Agrupar clientes por comportamiento" → Clustering
- "Reducir dimensionalidad" → PCA (unsupervised)

**Algoritmos clave:**
| Algoritmo | Uso |
|-----------|-----|
| **K-means** | Clustering — el más preguntado en el examen |
| K-Medoids | Clustering robusto a outliers |
| PCA | Reducción de dimensionalidad |
| Autoencoders | Compresión / detección de anomalías |

> **Regla de oro:** "Datos sin etiquetar + agrupar/segmentar" → **K-means**

---

#### Aprendizaje por Refuerzo (Reinforcement Learning)

Un **agente** aprende tomando acciones en un entorno para maximizar una **recompensa acumulada**. No hay datos etiquetados; el aprendizaje viene de la interacción.

**Componentes:**
- **Agente**: quien toma decisiones
- **Entorno**: con quien interactúa el agente
- **Estado**: situación actual
- **Acción**: decisión del agente
- **Recompensa**: señal de retroalimentación (positiva o negativa)
- **Política (Policy)**: estrategia del agente

**Cuándo aparece en el examen:**
- "Aprender por recompensas/penalizaciones" → Reinforcement Learning
- "Robot que navega un laberinto" → RL
- "Sistema de trading que optimiza ganancias" → RL
- "Juego de ajedrez / videojuego" → RL

---

#### Transfer Learning

Reutilizar un modelo preentrenado en un dominio como punto de partida para un nuevo dominio relacionado.

**Ventajas:** Menos datos necesarios, entrenamiento más rápido, mejor rendimiento con datasets pequeños.

**En el contexto del examen:** Fine-tuning de Foundation Models en Bedrock **es** transfer learning.

---

### Overfitting, Underfitting, Sesgo y Varianza

#### Overfitting (Sobreajuste)

El modelo aprende **demasiado bien los datos de entrenamiento**, incluyendo el ruido. Falla en datos nuevos.

**Señales:**
- Accuracy en train: 98% | Accuracy en test: 65% → **Overfitting**
- Loss de train baja, loss de validación sube

**Soluciones:**
| Técnica | Mecanismo |
|---------|-----------|
| **Regularización L1 (Lasso)** | Penaliza coeficientes, algunos → 0 (selección de features) |
| **Regularización L2 (Ridge)** | Penaliza coeficientes grandes (los reduce, no elimina) |
| **Dropout** (redes neuronales) | Desactiva neuronas aleatoriamente durante entrenamiento |
| **Early Stopping** | Para el entrenamiento cuando validación empeora |
| **Más datos de entrenamiento** | Reduce la influencia del ruido |
| **Reducir complejidad del modelo** | Menos capas, menos parámetros |
| **Data Augmentation** | Genera variaciones artificiales del dataset |

> **Patrón del examen:** "Train accuracy alta, test accuracy baja" → Overfitting → respuesta esperada: **aumentar regularización** o **más datos**

---

#### Underfitting (Subajuste)

El modelo es **demasiado simple** para capturar la relación en los datos. Falla tanto en train como en test.

**Señales:**
- Accuracy baja en train Y en test

**Soluciones:**
- Aumentar complejidad del modelo
- Más features relevantes (feature engineering)
- Reducir regularización
- Entrenar más epochs

---

#### Sesgo (Bias) vs Varianza (Variance)

| | **Bias Alto** | **Varianza Alta** |
|--|---------------|-------------------|
| **Qué es** | Modelo demasiado simple, supuestos erróneos | Modelo demasiado sensible al ruido del training |
| **Resultado** | Underfitting | Overfitting |
| **Error en train** | Alto | Bajo |
| **Error en test** | Alto | Alto |
| **Solución** | Más complejidad | Más datos / regularización |

**Bias-Variance Tradeoff:** No se puede eliminar ambos simultáneamente. Al aumentar complejidad, bias baja pero varianza sube.

---

## 2. Matriz de Métricas de Evaluación

### Conceptos Previos: La Matriz de Confusión

Para entender las métricas de clasificación:

|  | Predicho Positivo | Predicho Negativo |
|--|-------------------|-------------------|
| **Real Positivo** | TP (Verdadero Positivo) | FN (Falso Negativo) |
| **Real Negativo** | FP (Falso Positivo) | TN (Verdadero Negativo) |

---

### Tabla Comparativa de Métricas

| **Métrica** | **Fórmula** | **Definición técnica** | **Caso de uso en el examen** | **Priorizar cuando...** |
|-------------|-------------|------------------------|------------------------------|-------------------------|
| **Accuracy** | (TP+TN) / Total | % de predicciones correctas sobre el total | Clasificación balanceada general | Las clases están balanceadas y el coste de FP ≈ FN |
| **Precision** | TP / (TP+FP) | De todo lo que predije como positivo, ¿cuánto era realmente positivo? | Detección de spam, diagnóstico médico conservador | FP es muy costoso (preferimos no detectar que dar falsa alarma) |
| **Recall (Sensitivity)** | TP / (TP+FN) | De todos los positivos reales, ¿cuántos detecté? | Detección de cáncer, fraude bancario, fallos de seguridad | FN es muy costoso (no podemos perdernos un positivo real) |
| **F1-Score** | 2×(P×R)/(P+R) | Media armónica de Precision y Recall | Datasets desbalanceados donde ambos FP y FN importan | Clases desbalanceadas, coste de FP ≈ FN pero dataset asimétrico |
| **RMSE** | √(Σ(yi−ŷi)²/n) | Raíz del error cuadrático medio; penaliza outliers | Predicción de precios, forecasting numérico | Regresión, outliers importantes, unidades deben ser interpretables |
| **MAE** | Σ\|yi−ŷi\|/n | Error absoluto medio; robusto a outliers | Predicción de demanda, forecasting estable | Regresión, outliers no son importantes, quiero error promedio simple |

---

### Cuándo el Examen Exige Cada Métrica

**Accuracy:** "¿Cuántas imágenes clasificó correctamente?" → Accuracy (clases balanceadas, como clasificar enfermedades en plantas con igual distribución).

**Recall:** "Detección de tumores / fraude / fallos críticos" → Recall. El coste de perder un positivo real (FN) es altísimo. Es preferible tener falsos positivos que falsos negativos.

**Precision:** "Sistema de spam / recomendaciones intrusivas" → Precision. No queremos molestar a usuarios con falsos positivos. Preferimos ser conservadores.

**F1-Score:** "Dataset desbalanceado / clases poco representadas" → F1. Cuando hay muchos más negativos que positivos (ej: fraude = 0.1% del total), Accuracy engaña (99% accuracy prediciendo siempre 'no fraude'). F1 equilibra.

**RMSE:** "Predicción de temperatura / ventas / precio de acciones" → RMSE. Penaliza errores grandes. Si el modelo predice 100€ cuando el real es 200€, eso importa más que predecir 105€.

**MAE:** "Forecasting de inventario / demanda media" → MAE. Cuando los outliers son irrelevantes y se quiere el error medio interpretable en las mismas unidades que el target.

---

### Métricas de Evaluación para GenAI (Dominio 2, pero confunden con D1)

| **Métrica** | **Evalúa** | **Caso de uso** |
|-------------|------------|-----------------|
| **BLEU** | Solapamiento de n-gramas con referencia | Traducción automática |
| **ROUGE** | Recall de n-gramas vs resumen de referencia | Summarization de texto |
| **BERTScore** | Similitud semántica usando embeddings | Evaluación más semántica que léxica |

> **Trampa:** BLEU y ROUGE son para GenAI (D2), no para ML clásico (D1). Si el enunciado menciona "traducción" → BLEU. Si menciona "resumen" → ROUGE.

---

## 3. Pipeline de Machine Learning

### Fases del Pipeline

```
Datos Brutos
    │
    ▼
EDA (Exploratory Data Analysis)
    │  → Distribuciones, correlaciones, outliers, missing values
    ▼
Feature Engineering
    │  → Normalización, one-hot encoding, imputación, creación de features
    ▼
Split: Train / Validation / Test
    │  → Típico: 70/15/15 o 80/10/10
    ▼
Entrenamiento del Modelo
    │  → Algoritmo seleccionado + datos de train
    ▼
Hyperparameter Tuning
    │  → Optimizar learning rate, epochs, batch size, etc.
    │  → En AWS: SageMaker Automatic Model Tuning
    ▼
Evaluación (con datos de test)
    │  → Métricas finales
    ▼
Despliegue (Inference)
```

---

### SageMaker Feature Store

Repositorio centralizado para almacenar, recuperar y compartir features entre equipos y modelos.

**Cuándo usarlo (examen):** "Reutilizar features entre múltiples modelos" / "Consistencia entre entrenamiento e inferencia" → **SageMaker Feature Store**

---

## 4. Modos de Inferencia en SageMaker

Este es uno de los temas **más preguntados del D1**. Hay 4 modos y el examen da pistas específicas.

| **Modo** | **Latencia** | **Tamaño payload** | **Patrón de tráfico** | **Caso de uso típico** |
|----------|-------------|--------------------|-----------------------|------------------------|
| **Real-time Inference** | Milisegundos | Pequeño (<6MB) | Constante y predecible | APIs con baja latencia, recomendaciones en tiempo real |
| **Asynchronous Inference** | Segundos/minutos (near real-time) | Grande (hasta 1GB) | Esporádico con payloads grandes | Análisis de vídeo, procesamiento de documentos largos |
| **Serverless Inference** | Variable (cold start posible) | Pequeño | Esporádico e impredecible | Tráfico bajo e irregular, entornos de prueba |
| **Batch Transform** | Horas | Muy grande (TB) | Offline, sin urgencia | Predicciones masivas offline, procesamiento nocturno |

### Reglas Mnemotécnicas para el Examen

- **"near real-time" + "payload grande" (>6MB, hasta 1GB)** → **Asynchronous Inference**
- **"baja latencia" + "tiempo real"** → **Real-time Inference**
- **"tráfico esporádico" + "ligero"** → **Serverless Inference**
- **"millones de registros" + "no urgente" + "offline"** → **Batch Transform**
- **"processing time up to 1 hour"** → **Asynchronous Inference** (no Real-time)

> **Trampa frecuente:** "1 hora de procesamiento + near real-time" suena a Real-time, pero es **Asynchronous**. Real-time no aguanta esos tiempos ni tamaños.

---

## 5. Algoritmos: Cuándo Usar Cada Uno

### Árbol de Decisión (Decision Tree)

- **Tipo:** Clasificación o regresión
- **Interpretabilidad:** Alta — puedes trazar exactamente por qué el modelo tomó una decisión
- **Clave del examen:** "Documentar mecanismo interno" / "explicar decisiones" / "clasificar genes en categorías explicando el proceso" → **Decision Tree**

### Regresión Logística (Logistic Regression)

- **Tipo:** Clasificación binaria (salida: probabilidad 0-1)
- **Interpretabilidad:** Alta
- **No confundir:** A pesar del nombre "regresión", se usa para **clasificación**
- **Clave del examen:** "Predecir si un cliente abandona (sí/no)" → Logistic Regression

### K-Nearest Neighbors (k-NN)

- **Tipo:** Clasificación o regresión
- **Mecanismo:** Clasifica según los k vecinos más cercanos en el espacio de features
- **Clave del examen:** "Recomendar productos similares a los que el cliente compró" → k-NN
- **Clave del examen:** "Predecir la clasificación de flores/organismos basándose en medidas numéricas (longitud de pétalos, anchura de sépalos, etc.)" → k-NN

### K-means

- **Tipo:** Clustering (no supervisado)
- **Mecanismo:** Agrupa datos en k clusters minimizando la distancia al centroide
- **Clave del examen:** "Segmentar clientes sin etiquetas" / "agrupar documentos similares" → **K-means**

### Linear Regression

- **Tipo:** Regresión (predice valores continuos)
- **Clave del examen:** "Predecir precio / demanda / temperatura" con relación lineal → Linear Regression

---

## 6. Conceptos de Training vs Inference

| | **Training** | **Inference** |
|--|--------------|---------------|
| **Qué hace** | Aprende parámetros del modelo desde datos | Aplica el modelo aprendido a datos nuevos |
| **Coste computacional** | Alto (GPU intensivo, horas/días) | Bajo-moderado (milisegundos-minutos) |
| **Cuándo ocurre** | Una vez (o periódicamente para reentrenar) | Continuamente en producción |
| **Datos necesarios** | Dataset de entrenamiento etiquetado | Datos nuevos sin necesidad de etiquetas |

---

## 7. Time Series y Forecasting

**Cuándo aparece en el examen:** "Predecir demanda futura" / "forecast de ventas trimestrales" → Time Series

**Servicio AWS clave:** Amazon Forecast (servicio gestionado para time series)

**Conceptos:**
- **Seasonality:** Patrones que se repiten periódicamente (ventas navideñas)
- **Trend:** Tendencia a largo plazo (crecimiento sostenido)
- **Stationarity:** Una serie estacionaria tiene media y varianza constantes en el tiempo

---

## 8. Patrones de Examen — Cheat Sheet D1

### Tipos de Aprendizaje

| **Palabra clave en el enunciado** | **Respuesta correcta** |
|-----------------------------------|------------------------|
| "datos etiquetados" + "clasificar/predecir" | Supervised Learning |
| "datos sin etiquetar" + "agrupar/segmentar" | Unsupervised Learning / K-means |
| "aprender por recompensas" / "agente" / "penalización" | Reinforcement Learning |
| "reutilizar modelo preentrenado" | Transfer Learning |
| "datos etiquetados por humanos iterativamente" | Active Learning |

### Algoritmos

| **Palabra clave en el enunciado** | **Respuesta correcta** |
|-----------------------------------|------------------------|
| "explicar mecanismo interno" + "clasificar categorías" | Decision Tree |
| "caja negra" + "máxima precisión" | Neural Network |
| "segmentar clientes sin etiquetas" | K-means |
| "predecir sí/no (binario)" + "interpretable" | Logistic Regression |
| "predecir valor numérico continuo" | Linear Regression |
| "recomendar items similares" | k-NN |
| "múltiples features numéricas + clasificar en categorías (flores, genes, muestras biológicas)" | k-NN |

### Métricas

| **Palabra clave en el enunciado** | **Respuesta correcta** |
|-----------------------------------|------------------------|
| "% imágenes clasificadas correctamente" / clases balanceadas | Accuracy |
| "detección de cáncer" / "no perder ningún positivo" / FN costoso | Recall |
| "filtro de spam" / "no molestar usuarios" / FP costoso | Precision |
| "dataset desbalanceado" / "clases raras" | F1-Score |
| "predicción numérica" + "penalizar outliers grandes" | RMSE |
| "predicción numérica" + "error promedio simple" + robustez | MAE |

### Overfitting / Underfitting

| **Palabra clave en el enunciado** | **Respuesta correcta** |
|-----------------------------------|------------------------|
| "train accuracy alta, test accuracy baja" | Overfitting |
| "reducir overfitting" | Regularización (L1/L2) / más datos / dropout |
| "train accuracy baja Y test accuracy baja" | Underfitting |
| "reducir underfitting" | Más complejidad / más features / menos regularización |

### SageMaker Inference

| **Palabra clave en el enunciado** | **Respuesta correcta** |
|-----------------------------------|------------------------|
| "baja latencia" + "tiempo real" + payload pequeño | Real-time Inference |
| "payload grande (hasta 1GB)" + "near real-time" | Asynchronous Inference |
| "tráfico esporádico" + "ligero" + ahorro de costes | Serverless Inference |
| "millones de registros" + "offline" + "sin urgencia" | Batch Transform |
| "processing time hasta 1 hora" | Asynchronous Inference |

### Servicios AWS D1

| **Palabra clave en el enunciado** | **Respuesta correcta** |
|-----------------------------------|------------------------|
| "plataforma ML end-to-end" | Amazon SageMaker |
| "compartir features entre modelos" / "consistencia train-inference" | SageMaker Feature Store |
| "ajuste automático de hiperparámetros" | SageMaker Automatic Model Tuning |
| "predicción de demanda / time series" | Amazon Forecast |
| "ML sin código para usuarios sin experiencia técnica" | SageMaker Canvas |

---

## 9. Práctica Recomendada

```bash
# Quiz solo D1 (cuando esté clasificado)
python core/engine.py --cert aws-ai-practitioner --mode quiz --count 26 --shuffle

# Quiz completo con énfasis en fundamentos
python core/engine.py --cert aws-ai-practitioner --mode quiz --count 20 --shuffle
```

---

_Guía generada el 2 de junio de 2026 · Basada en 26 preguntas del banco oficial AIF-C01_
