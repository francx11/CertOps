# D5 · Seguridad y Gobernanza (14% del examen)

**7 preguntas · Peso: 14% · Preguntas del banco: 13, 28, 30, 40, 95, 117, 149**

---

## 1. Política de Privacidad de Datos en Amazon Bedrock

### Aislamiento de datos del cliente

Amazon Bedrock garantiza que los datos del cliente están completamente aislados de los datos de otros clientes y de los proveedores de modelos base:

- **Datos de entrenamiento y customización** (fine-tuning, continued pre-training): los datos que el cliente proporciona para personalizar un modelo **nunca se usan para entrenar los modelos base de terceros** (Anthropic, Meta, Mistral, etc.). AWS actúa como procesador de datos, no como propietario.
- **Datos en inferencia** (prompts y respuestas): no son almacenados permanentemente por Bedrock ni enviados a los proveedores del modelo. El cliente controla si activa el **invocation logging** (que sí guarda datos, pero en el bucket S3/CloudWatch del cliente).
- **Modelos personalizados**: los artefactos generados por un job de fine-tuning pertenecen exclusivamente al cliente. Son almacenados en el entorno del cliente, cifrados por defecto con clave de servicio AWS, y opcionalmente con **AWS KMS customer-managed key (CMK)**.

### Responsabilidad compartida (Shared Responsibility Model aplicado a Bedrock)

| **Capa** | **Responsabilidad AWS** | **Responsabilidad del Cliente** |
|----------|------------------------|---------------------------------|
| Infraestructura física | ✅ | ❌ |
| Patching del servicio Bedrock | ✅ | ❌ |
| Modelos base (proveedores) | ✅ | ❌ |
| **Datos en tránsito** | ❌ | ✅ (TLS activado, endpoint VPC) |
| **Datos en reposo** (personalizaciones, KB) | ❌ | ✅ (KMS CMK) |
| **IAM: quién invoca el modelo** | ❌ | ✅ |
| **Prompt y output logging** | ❌ | ✅ (el cliente elige si activa) |

> **Regla de examen (Q87):** "¿Qué es responsabilidad del cliente en Bedrock?" → Siempre es **datos en tránsito y en reposo**.

---

## 2. Infraestructura de Seguridad Aplicada a IA

### 2.1 AWS IAM — Control de acceso a nivel de modelo

**Qué resuelve:** quién puede invocar qué modelo en Bedrock/SageMaker y con qué datos.

**Patrón de examen:** empresa con múltiples equipos → un rol IAM por equipo con acceso solo a su bucket S3 (Q66). El principio es **least privilege** (mínimo privilegio necesario).

```
Equipo A → IAM Role A → Bedrock (InvokeModel) + S3 bucket-equipo-A
Equipo B → IAM Role B → Bedrock (InvokeModel) + S3 bucket-equipo-B
```

- **Políticas relevantes**: `bedrock:InvokeModel`, `bedrock:InvokeModelWithResponseStream`, `s3:GetObject`
- **SSE-S3 + IAM**: si el bucket usa SSE-S3, el rol de Bedrock necesita permiso `s3:GetObject` en ese bucket. No necesita permiso KMS adicional porque SSE-S3 usa claves gestionadas por S3. (Q9: el fallo era falta de permiso IAM, no problema de KMS).
- **Uso seguro de LLMs en Bedrock** (Q34): diseñar prompts claros + configurar roles IAM con least privilege.

| **Necesidad** | **Solución IAM** |
|---------------|-----------------|
| Múltiples equipos, datos separados | Un IAM role por equipo |
| FM Bedrock accede a S3 | Role con `s3:GetObject` en el bucket correcto |
| Auditar quién invocó Bedrock | CloudTrail (no IAM) |
| Bloquear acceso no autorizado | Políticas de denegación explícita |

### 2.2 AWS KMS — Cifrado de datos en reposo

**Qué resuelve:** cifrado con clave propia (CMK) para artefactos de customización y Knowledge Bases.

- **Caso de uso en examen (Q104):** empresa usa modelos customizados en Bedrock y quiere cifrar los artefactos del model customization job con una **clave gestionada por la empresa** → **AWS KMS**.
- KMS no gestiona secretos ni credenciales → eso es **Secrets Manager**.
- KMS no detecta datos sensibles → eso es **Amazon Macie**.
- KMS no escanea vulnerabilidades → eso es **Amazon Inspector**.

**Qué se puede cifrar con KMS en el ecosistema AI:**

| **Artefacto** | **Cifrado KMS aplicable** |
|---------------|--------------------------|
| Artefactos de fine-tuning Bedrock | ✅ CMK |
| Knowledge Base (vectores en OpenSearch) | ✅ CMK |
| Datos de entrenamiento en S3 | ✅ CMK (via S3 SSE-KMS) |
| Endpoints de SageMaker | ✅ CMK |
| SageMaker Feature Store | ✅ CMK |

### 2.3 Amazon VPC + AWS PrivateLink — Tráfico privado sin internet

**Qué resuelve:** ejecutar cargas de trabajo de IA sin que el tráfico salga a internet público, cumpliendo normativas regulatorias.

**AWS PrivateLink** crea un **VPC endpoint** (Interface Endpoint) para Amazon Bedrock:

```
VPC del cliente
  └── EC2 / Lambda / ECS
       └── Interface VPC Endpoint (PrivateLink)
            └── Amazon Bedrock (sin pasar por internet público)
```

- **Caso de examen (Q13):** institución financiera, VPC sin acceso a internet, debe usar Bedrock → **AWS PrivateLink**.
- **Distractores comunes:** Amazon CloudFront (CDN, no aplica), Internet Gateway (requiere internet), Amazon Macie (seguridad de datos S3, no conectividad).

**SageMaker Network Isolation (Q90):**
- Para jobs de training/inference en SageMaker sin internet: activar **network isolation** en el job.
- Diferente de PrivateLink: network isolation desactiva toda conectividad de red del contenedor de entrenamiento.

| **Servicio** | **Caso de uso** | **Bloquea internet** |
|--------------|----------------|----------------------|
| AWS PrivateLink (VPC Endpoint) | Conectar VPC a Bedrock/SageMaker API privadamente | Sí (el tráfico no sale a internet) |
| SageMaker Network Isolation | Contenedor de training sin red | Sí (aislamiento total del contenedor) |
| Security Group | Reglas de firewall para EC2/ENI | Parcial (control granular) |

### 2.4 AWS CloudTrail — Auditoría de APIs de IA

**Qué resuelve:** registrar quién llamó a qué API de Bedrock/SageMaker, cuándo y desde dónde.

- **Caso de examen (Q26):** empresa quiere identificar intentos de acceso no autorizado a Bedrock FMs → **AWS CloudTrail** (registra eventos de API como `bedrock:InvokeModel`, con identidad IAM, IP, timestamp).
- CloudTrail ≠ CloudWatch: CloudTrail es auditoría de **quién hizo qué** (API calls). CloudWatch es monitoreo de **métricas y logs en tiempo real**.

**Servicios confundidos con CloudTrail:**

| **Servicio** | **Propósito** | **No es CloudTrail** |
|--------------|---------------|----------------------|
| AWS Audit Manager | Automatizar evaluaciones de cumplimiento | Recoge evidencias, no registra APIs en tiempo real |
| Amazon Fraud Detector | Detección de fraude en transacciones | No aplica a acceso a APIs |
| AWS Trusted Advisor | Recomendaciones de buenas prácticas | No es auditoría de acceso |

### 2.5 Amazon CloudWatch — Monitoreo de aplicaciones de IA

**Qué resuelve:** métricas operacionales, logs de aplicación, alarmas.

- **CloudWatch Logs**: almacena logs de Bedrock invocation logging (cuando está activado por el cliente), logs de Lambda, ECS.
- **CloudWatch Metrics**: latencia de inferencia, errores de throttling, uso de tokens.
- **CloudWatch Alarms**: alertas sobre umbrales (e.g., tasa de error > 5%).

> **Trampa de examen:** CloudWatch NO detecta bias ni hace modelos explicables (Q34, distractor D). Para bias/explicabilidad → **SageMaker Clarify**.

---

## 3. Servicios de Gobernanza y Cumplimiento

### AWS Artifact — Compliance reports de terceros

- **Caso de examen (Q28):** empresa recibe auditorías de ISVs (vendors independientes) y necesita notificaciones cuando los compliance reports estén disponibles → **AWS Artifact**.
- AWS Artifact proporciona acceso bajo demanda a reportes de cumplimiento de AWS (SOC, PCI-DSS, ISO 27001, HIPAA, etc.) y acuerdos.
- Los reportes se pueden descargar y compartir con auditores.

### AWS Audit Manager — Automatización de evidencias de cumplimiento

- Recopila evidencias de cumplimiento automáticamente desde múltiples fuentes AWS.
- Mapea controles a frameworks como GDPR, HIPAA, PCI-DSS, SOC 2.
- **Caso de examen (Q149 área):** cuando se menciona "automatizar la recopilación de evidencias de cumplimiento continuo" → AWS Audit Manager.
- **No confundir con Artifact**: Artifact = descargar reportes existentes. Audit Manager = generar evidencias propias continuas.

### AWS Config — Monitoreo de configuraciones

- Registra cambios en configuraciones de recursos AWS y evalúa el cumplimiento de reglas.
- **Caso de examen (Q149 área):** cuando se menciona "monitorear que los recursos cumplan con políticas de seguridad" → AWS Config.
- Ejemplo: verificar que todos los endpoints de SageMaker tengan cifrado KMS habilitado.

### Amazon Macie — Datos sensibles en S3

- Descubre y protege datos sensibles (PII, credenciales, datos financieros) en Amazon S3 usando ML.
- **Caso de examen (Q142 área):** "detectar datos sensibles en S3" → Amazon Macie.
- No cifra datos (eso es KMS). No controla acceso (eso es IAM). Solo detecta.

### AWS Trusted Advisor — Recomendaciones de Mejores Prácticas

- Analiza el entorno AWS y da recomendaciones en 5 categorías: **Cost Optimization, Performance, Security, Fault Tolerance, Service Limits**.
- **Caso de examen:** "recomendaciones de mejores prácticas de seguridad" o "identificar configuraciones de seguridad subóptimas" → **AWS Trusted Advisor**.
- En contexto AI/ML: detecta buckets S3 con acceso público (datos de entrenamiento expuestos), roles IAM con permisos excesivos, MFA no habilitado en la cuenta root.
- **No confundir con:** CloudTrail (auditoría de APIs), Audit Manager (evidencias de cumplimiento), AWS Config (cambios de configuración de recursos).

### AWS S3 Lifecycle Policies — Ciclo de Vida de Datos

- Reglas automáticas que transicionan o eliminan objetos S3 según su antigüedad.
- **Relevancia en AI/ML:**
  - Mover datos de entrenamiento: S3 Standard → S3 Glacier tras 90 días (ahorro de costos)
  - Eliminar logs de inferencia automáticamente tras período de retención (ej. 365 días)
  - Implementar **derecho al olvido** (GDPR): eliminar datos de individuos cuando lo soliciten
- **Caso de examen:** "automatizar retención de datos de entrenamiento" o "gestionar ciclo de vida de artefactos de modelos" → **S3 Lifecycle Policies**.
- No es servicio de seguridad per se — es gobernanza del ciclo de vida de datos.

---

## 4. Datos: Linaje, Catalogación y Trabajo Seguro

### 4.1 Data Lineage — Trazabilidad de Datos

**Qué es:** rastreo del origen, transformaciones y movimientos de los datos a lo largo del pipeline de ML.

**Por qué importa:**
- Cumplimiento GDPR: saber de qué datos se entrenó un modelo (derecho al olvido, trazabilidad).
- Auditoría: responder "¿qué datos produjeron este modelo?" ante reguladores.
- Detectar data poisoning: si un modelo se degrada, el linaje permite rastrear los datos sospechosos.

**Servicio AWS:** **Amazon SageMaker ML Lineage Tracking** — registra automáticamente artefactos, datasets, transformaciones y modelos en un grafo de linaje trazable.

### 4.2 Data Cataloging — Inventario de Activos de Datos

**Qué es:** registro organizado de activos de datos con metadatos (esquema, ubicación, propietario, clasificación de sensibilidad).

| **Servicio** | **Función** |
|-------------|------------|
| **AWS Glue Data Catalog** | Repositorio central de metadatos para datos en S3, RDS, Redshift. Integrado con Athena, EMR, SageMaker |
| **Amazon DataZone** | Portal de gobernanza: catálogo, descubrimiento y control de acceso a activos de datos entre equipos |

- **Caso de examen:** "inventario centralizado de metadatos" → **AWS Glue Data Catalog**. "Gobernanza y descubrimiento de datos entre equipos" → **Amazon DataZone**.

### 4.3 Trabajo Seguro con Datos

#### Evaluación de calidad de datos

- Datos de baja calidad producen modelos sesgados, inexactos o poco fiables.
- Dimensiones clave: completitud, unicidad, consistencia, exactitud, validez.
- **AWS Glue DataBrew**: perfilado y limpieza visual de datos sin código.
- **SageMaker Data Wrangler**: preparación y análisis de calidad de datos para ML.

#### Anonimización y Privacidad Diferencial

| **Técnica** | **Descripción** | **Cuándo usar** |
|-------------|----------------|----------------|
| **Anonimización** | Elimina identificadores directos (nombre, SSN, email). Irreversible | Datasets de entrenamiento con PII |
| **Pseudonimización** | Reemplaza IDs con tokens reversibles mediante clave | Datos que pueden necesitar re-identificación |
| **Privacidad diferencial** | Añade ruido estadístico controlado; protege privacidad individual manteniendo utilidad estadística | Analytics agregados, entrenamiento federado |

> **Privacidad diferencial:** garantiza matemáticamente que la presencia/ausencia de un individuo en el dataset no sea detectable en el output del modelo o análisis. Permite compartir resultados estadísticos sin revelar datos individuales.

#### IAM para datos seguros

- **Least privilege** en acceso a datos de entrenamiento: cada pipeline/rol solo accede al bucket que necesita.
- **S3 Block Public Access**: activar en todos los buckets con datos de entrenamiento o artefactos de modelos.
- **S3 Bucket Policies + IAM Roles**: separar acceso por equipo o proyecto de ML.

#### Verificación de seguridad de datos

| **Necesidad** | **Servicio** |
|---------------|-------------|
| Detectar PII en S3 | **Amazon Macie** |
| Escanear vulnerabilidades en instancias/contenedores | **Amazon Inspector** |
| Vista centralizada de hallazgos de seguridad | **AWS Security Hub** |
| Detectar acceso anómalo a datos (exfiltración) | **Amazon GuardDuty** |

---

## 5. Amenazas de Seguridad Específicas de GenAI

### Jailbreak

- **Definición:** técnica para eludir las restricciones de seguridad de un FM y producir contenido dañino, prohibido o fuera de los guardrails configurados.
- **Caso de examen (Q89):** empresa está probando seguridad de un FM intentando **saltarse las safety features para generar contenido dañino** → **Jailbreak** (no es fuzzing, DoS, ni penetration testing convencional).

### Prompt Injection

- **Definición:** ataque en el que un actor malicioso inyecta instrucciones en el prompt para manipular el comportamiento del modelo y hacer que ignore las instrucciones originales del sistema.
- **Defensa (Q95):** técnica de **adversarial prompting** — el sistema utiliza prompts diseñados para resistir manipulaciones, instruyendo al modelo sobre cómo responder ante intentos de inyección.

| **Amenaza** | **Descripción** | **Defensa** |
|-------------|----------------|-------------|
| Jailbreak | Eludir safety features del FM | Bedrock Guardrails, Adversarial Prompting |
| Prompt Injection | Manipular instrucciones del sistema via input del usuario | Adversarial Prompting, separación de contextos |
| Data Poisoning | Contaminar datos de entrenamiento | Validación de datasets, acceso restringido |
| Model Extraction | Replicar el modelo mediante consultas masivas | Rate limiting, throttling IAM |
| Adversarial Inputs | Inputs diseñados para provocar predicciones erróneas | SageMaker Clarify, testing adversarial |
| Exfiltración de datos | Robo de datos de entrenamiento o artefactos de modelos | GuardDuty, PrivateLink, KMS, IAM least privilege |

### Generative AI Security Scoping Matrix

Framework para determinar nivel de responsabilidad de seguridad del cliente según el nivel de customización:

| **Scope** | **Descripción** | **Responsabilidad del cliente** |
|-----------|----------------|--------------------------------|
| A | App de tercero con GenAI embebida (ej. Salesforce + Einstein) | Mínima |
| B | Usar FM de tercero vía API (ej. Bedrock con Anthropic Claude) | Baja-Media |
| C | Fine-tuning de FM existente con datos propios | Media-Alta |
| **D** | **Construir y entrenar modelo desde cero** | **Máxima** |

> **Regla de examen (Q30):** "¿Qué scope da MÁS propiedad de seguridad al cliente?" → **Scope D: construir desde cero**.

### Detección de Amenazas

| **Servicio** | **Qué detecta** |
|-------------|----------------|
| **Amazon GuardDuty** | Comportamiento malicioso: llamadas API sospechosas, acceso inusual a S3 con datos de entrenamiento, actividad desde IPs maliciosas, posible exfiltración de modelos |
| **Amazon Detective** | Investiga y analiza la causa raíz de actividad sospechosa detectada por GuardDuty |
| **AWS Security Hub** | Agrega hallazgos de GuardDuty, Macie, Inspector en una vista centralizada con puntuación de seguridad |

- **Caso de examen:** "detectar comportamiento anómalo en recursos de IA" → **Amazon GuardDuty**. "Investigar causa raíz de incidente de seguridad" → **Amazon Detective**.

### Gestión de Vulnerabilidades

- **Amazon Inspector**: escaneo continuo y automático de CVEs en EC2, funciones Lambda y contenedores ECR. Relevante para infraestructura de entrenamiento e inferencia de SageMaker.
- Aplicar parches regularmente a instancias de SageMaker Studio e imágenes de contenedores de entrenamiento.
- **Model Vulnerability Assessment**: evaluar si el modelo puede ser objeto de adversarial attacks (inputs maliciosos diseñados para engañar al modelo).

---

## 6. Estándares de Transparencia

### Model Cards

- Documentos que describen propósito, métricas de rendimiento, sesgos conocidos, limitaciones y casos de uso apropiados de un modelo.
- **AWS Bedrock Model Cards**: AWS proporciona model cards para los FMs disponibles (Claude, Titan, Llama, Mistral, etc.).
- Permiten evaluar si un modelo es adecuado para un caso de uso antes de adoptarlo.

### Explicabilidad de Modelos

- **SageMaker Clarify**: genera explicaciones de predicciones individuales (SHAP values) y detecta sesgos en datos y modelos pre/post-entrenamiento.
- **Caso de examen:** "explicar por qué el modelo tomó una decisión" o "detectar bias en el modelo" → **SageMaker Clarify** (no CloudWatch, no CloudTrail).

### Reporting de Cumplimiento

- **AWS Artifact**: acceso a reportes de cumplimiento de AWS (SOC 1/2/3, PCI-DSS, ISO 27001, HIPAA BAA).
- **Transparencia regulatoria**: informar a usuarios finales cuando interactúan con IA (requerimiento del EU AI Act y legislación estatal en EEUU).

---

## 7. Capacitación del Equipo

Elemento clave de gobernanza: el factor humano es frecuentemente el eslabón más débil en la seguridad de sistemas de IA.

### Áreas de capacitación prioritarias

| **Área** | **Contenido** |
|----------|--------------|
| **Seguridad en IA** | Reconocer prompt injection, jailbreak, data poisoning. Políticas de uso aceptable de GenAI |
| **Manejo de datos** | Qué datos pueden enviarse a FMs externos, clasificación de sensibilidad, anonimización |
| **Respuesta a incidentes** | Procedimientos ante filtración de datos de entrenamiento, compromiso de modelo, uso indebido de IA |
| **Cumplimiento** | GDPR, HIPAA, AI Act: obligaciones legales en el uso de IA |

### Recursos AWS

- **AWS Training & Certification**: cursos oficiales (AWS AI Practitioner, ML Specialty, Security Specialty).
- **AWS Well-Architected Framework — ML Lens**: guía de mejores prácticas para construir sistemas ML seguros, fiables y eficientes.
- **Bedrock Responsible AI**: políticas de uso aceptable y mejores prácticas publicadas por AWS para los FMs disponibles.

---

## 8. Patrones de Examen — Cheat Sheet

### Tabla de mapeo: Requisito → Servicio correcto

| **Enunciado / Requisito de seguridad** | **Servicio / Configuración correcta** |
|----------------------------------------|--------------------------------------|
| VPC sin internet necesita acceder a Bedrock | **AWS PrivateLink** (VPC Interface Endpoint) |
| Cifrar artefactos de model customization con clave propia | **AWS KMS** (customer-managed key) |
| Identificar accesos no autorizados a APIs de Bedrock | **AWS CloudTrail** |
| Equipos separados acceden a datos separados en Bedrock | **IAM Role por equipo** (least privilege) |
| Recibir compliance reports de ISVs/auditores externos | **AWS Artifact** |
| Automatizar recopilación de evidencias de cumplimiento | **AWS Audit Manager** |
| Monitorear cumplimiento de configuraciones de recursos | **AWS Config** |
| Detectar datos sensibles (PII) en S3 | **Amazon Macie** |
| Gestionar credenciales, API keys, contraseñas | **AWS Secrets Manager** (no KMS) |
| Responsabilidad del cliente en Bedrock | **Datos en tránsito y en reposo** |
| Mayor propiedad de seguridad (Scoping Matrix) | **Scope D: construir desde cero** |
| SageMaker jobs sin acceso a internet (aislamiento) | **SageMaker Network Isolation** |
| FM elude safety features para contenido dañino | **Jailbreak** |
| Proteger contra prompt injection | **Adversarial Prompting** |
| Audit de quién invocó qué FM en Bedrock (API-level) | **CloudTrail** (no CloudWatch, no Audit Manager) |
| Detectar drift en modelo en producción | **SageMaker Model Monitor** (no D5, pero confusión común) |
| Monitoreo de métricas y logs de app de IA | **Amazon CloudWatch** |
| Trazabilidad de datos del pipeline ML (data lineage) | **SageMaker ML Lineage Tracking** |
| Inventario centralizado de metadatos de datos | **AWS Glue Data Catalog** |
| Gobernanza y descubrimiento de datos entre equipos | **Amazon DataZone** |
| Automatizar retención / ciclo de vida de datos en S3 | **S3 Lifecycle Policies** |
| Recomendaciones de mejores prácticas de seguridad AWS | **AWS Trusted Advisor** |
| Detectar comportamiento anómalo / acceso sospechoso | **Amazon GuardDuty** |
| Investigar causa raíz de incidente de seguridad | **Amazon Detective** |
| Vista centralizada de hallazgos de seguridad multi-servicio | **AWS Security Hub** |
| Perfilado y limpieza de datos sin código | **AWS Glue DataBrew** |
| Preparación y análisis de calidad de datos para ML | **SageMaker Data Wrangler** |
| Explicabilidad de predicciones / detección de bias | **SageMaker Clarify** |
| Proteger privacidad estadística en analytics o modelos | **Privacidad diferencial** |

### Distractores frecuentes a evitar

| **Respuesta trampa** | **Por qué es incorrecta** | **Respuesta correcta** |
|---------------------|--------------------------|------------------------|
| Amazon Macie → cifrar datos | Macie detecta, no cifra | AWS KMS |
| Amazon Inspector → cifrar datos | Inspector escanea vulnerabilidades, no cifra | AWS KMS |
| AWS Artifact → auditar acceso a APIs | Artifact da reportes de compliance, no logs de API | AWS CloudTrail |
| CloudWatch → auditar acceso no autorizado | CloudWatch monitorea métricas/logs, no API calls de seguridad | AWS CloudTrail |
| Internet Gateway → Bedrock en VPC sin internet | Internet Gateway requiere internet | AWS PrivateLink |
| Amazon CloudFront → tráfico privado VPC a Bedrock | CloudFront es CDN, no VPC endpoint | AWS PrivateLink |
| Prompt Engineering → controlar acceso a FMs | Prompts no controlan IAM | IAM Roles + Policies |
| KMS → gestionar passwords/API keys | KMS es para claves de cifrado | AWS Secrets Manager |

---

_Guía actualizada el 2026-06-02 · Cubre: responsabilidad compartida, data lineage, data cataloging, trabajo seguro con datos (calidad, anonimización, privacidad diferencial, IAM), detección de amenazas, gestión de vulnerabilidades, Trusted Advisor, S3 Lifecycle Policies, Scoping Matrix, estándares de transparencia y capacitación del equipo · AIF-C01 Dominio 5: Seguridad y Gobernanza (14%)_
