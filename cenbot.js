/* ===================== CENBOT - Chatbot IA para Adaptia Consultoría ===================== */
/* 
  INSTRUCCIONES:
  1. Reemplaza "TU_API_KEY_AQUI" con tu API Key de Gemini (aistudio.google.com)
  2. Pega este script al final de tu index.html, antes de </body>:
     <script src="cenbot.js"></script>
*/

(function () {
  // ============================================================
  // ⚙️ CONFIGURACIÓN — edita aquí la info de tu negocio
  // ============================================================
  // URLs posibles de tu Cloudflare Worker (usa window.CENBOT_WORKER_URL para sobreescribir en producción)
  const WORKER_URLS = [
    window.CENBOT_WORKER_URL,
    'https://220300420.220300420.workers.dev',
    'https://220300420.workers.dev'
  ].filter(Boolean);

  const SYSTEM_PROMPT = `
Eres CenBot, el asistente virtual inteligente de Adaptia Consultoría.
Adaptia se especializa en transformación digital para PyMEs del sector automotriz en México (talleres mecánicos, concesionarias, talleres de pintura, distribuidores de refacciones, etc.).

INFORMACIÓN DE LA EMPRESA:
- Nombre: Adaptia Consultoría
- Especialidad: Digitalización y consultoría para negocios automotrices
- Misión: Ayudar a PyMEs automotrices a implementar herramientas digitales prácticas, optimizar procesos y mejorar rentabilidad

SERVICIOS QUE OFRECEMOS:
- Diagnóstico y mapeo de procesos operativos
- Implementación digital integral (CRM, inventario, facturación, dashboards, automatización, KPIs)
- Control de órdenes de servicio
- Seguimiento a clientes
- Decisiones basadas en datos

PAQUETES DISPONIBLES:
1. Adaptia Start — Primer paso hacia la digitalización: evaluación inicial, mapeo de procesos, diagnóstico de digitalización, implementación de 1 herramienta digital básica, reporte ejecutivo.
2. Adaptia Pro (más popular) — Digitalización de múltiples áreas: todo lo del Start + hasta 3 herramientas digitales (CRM, inventario, facturación, control financiero) + automatización básica + KPIs operativos.
3. Adaptia Elite — Transformación completa: diagnóstico profundo, rediseño integral de procesos, integración total de sistemas, analítica avanzada, automatización avanzada, medición de retorno operativo.

RESULTADOS REALES DE CLIENTES:
- Taller mecánico: redujo papeleo de 3 horas/día a 20 minutos con sistema digital
- Concesionaria: mejoró exactitud de inventario de 70% a 94% en 6 semanas
- Taller de pintura: aumentó clientes recurrentes un 40% con CRM simple

CONTACTO:
- Formulario en la sección "Contacto" de la página web
- Respondemos en menos de 24 horas

INSTRUCCIONES DE COMPORTAMIENTO:
- Sé amable, profesional pero cercano. Habla en español mexicano natural.
- Responde preguntas sobre los servicios, paquetes, precios y procesos de Adaptia.
- Si no sabes el precio exacto de un paquete, invita al usuario a solicitar un diagnóstico gratuito.
- Si el usuario muestra interés, invítalo a llenar el formulario de contacto o ir a la sección de paquetes.
- Mantén respuestas cortas y directas (máximo 3-4 oraciones).
- Si te preguntan algo que no tiene que ver con Adaptia, redirige amablemente la conversación.
- NO inventes información que no esté en este prompt.
`;

  // ============================================================
  // 🎨 ESTILOS — encajan con el diseño de Adaptia (azul #0072ff)
  // ============================================================
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');

    #cenbot-btn {
      position: fixed;
      right: var(--fab-right, 1.25rem);
      bottom: calc(var(--fab-bottom, 1.25rem) + var(--fab-size, 58px) + var(--fab-gap, 14px));
      z-index: 9998;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0072ff, #00c6ff);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 24px rgba(0,114,255,0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
      animation: cenbot-pulse 2.5s ease-in-out infinite;
    }
    #cenbot-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 8px 32px rgba(0,114,255,0.55);
    }
    #cenbot-btn svg { width: 26px; height: 26px; fill: white; }
    #cenbot-btn .cenbot-badge {
      position: absolute;
      top: -4px; right: -4px;
      width: 14px; height: 14px;
      background: #00e676;
      border-radius: 50%;
      border: 2px solid white;
    }

    @keyframes cenbot-pulse {
      0%, 100% { box-shadow: 0 4px 24px rgba(0,114,255,0.45); }
      50% { box-shadow: 0 4px 36px rgba(0,114,255,0.7); }
    }

    #cenbot-window {
      position: fixed;
      bottom: calc(var(--fab-bottom, 1.25rem) + (var(--fab-size, 58px) * 2) + (var(--fab-gap, 14px) * 2));
      right: var(--fab-right, 1.25rem);
      z-index: 9999;
      width: 360px;
      max-height: 520px;
      border-radius: 20px;
      background: #0a0f1e;
      border: 1px solid rgba(0,114,255,0.25);
      box-shadow: 0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: 'Sora', sans-serif;
      transform: scale(0.85) translateY(20px);
      opacity: 0;
      pointer-events: none;
      transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease;
    }
    #cenbot-window.open {
      transform: scale(1) translateY(0);
      opacity: 1;
      pointer-events: all;
    }

    /* Header */
    .cenbot-header {
      padding: 16px 18px;
      background: linear-gradient(135deg, #0072ff 0%, #0050b8 100%);
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .cenbot-avatar {
      width: 40px; height: 40px;
      border-radius: 50%;
      background: rgba(255,255,255,0.15);
      display: flex; align-items: center; justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }
    .cenbot-info { flex: 1; }
    .cenbot-name { font-size: 14px; font-weight: 700; color: white; letter-spacing: 0.3px; }
    .cenbot-status { font-size: 11px; color: rgba(255,255,255,0.75); display: flex; align-items: center; gap: 5px; margin-top: 1px; }
    .cenbot-dot { width: 7px; height: 7px; border-radius: 50%; background: #00e676; display: inline-block; }
    .cenbot-close {
      background: rgba(255,255,255,0.15); border: none; cursor: pointer;
      width: 28px; height: 28px; border-radius: 50%;
      color: white; font-size: 16px; display: flex; align-items: center; justify-content: center;
      transition: background 0.2s;
    }
    .cenbot-close:hover { background: rgba(255,255,255,0.3); }

    /* Messages */
    .cenbot-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scrollbar-width: thin;
      scrollbar-color: rgba(0,114,255,0.3) transparent;
    }
    .cenbot-messages::-webkit-scrollbar { width: 4px; }
    .cenbot-messages::-webkit-scrollbar-track { background: transparent; }
    .cenbot-messages::-webkit-scrollbar-thumb { background: rgba(0,114,255,0.3); border-radius: 2px; }

    .cenbot-msg {
      max-width: 82%;
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 13px;
      line-height: 1.55;
      animation: cenbot-fadein 0.3s ease;
    }
    @keyframes cenbot-fadein {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .cenbot-msg.bot {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.08);
      color: #e8ecf4;
      border-bottom-left-radius: 4px;
      align-self: flex-start;
    }
    .cenbot-msg.user {
      background: linear-gradient(135deg, #0072ff, #0055cc);
      color: white;
      border-bottom-right-radius: 4px;
      align-self: flex-end;
    }

    /* Typing indicator */
    .cenbot-typing {
      display: flex; gap: 5px; align-items: center;
      padding: 12px 16px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px; border-bottom-left-radius: 4px;
      align-self: flex-start;
      animation: cenbot-fadein 0.3s ease;
    }
    .cenbot-typing span {
      width: 7px; height: 7px; border-radius: 50%;
      background: rgba(0,114,255,0.8);
      animation: cenbot-bounce 1.1s ease-in-out infinite;
    }
    .cenbot-typing span:nth-child(2) { animation-delay: 0.18s; }
    .cenbot-typing span:nth-child(3) { animation-delay: 0.36s; }
    @keyframes cenbot-bounce {
      0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
      40% { transform: translateY(-6px); opacity: 1; }
    }

    /* Quick replies */
    .cenbot-quickreplies {
      display: flex; flex-wrap: wrap; gap: 6px;
      padding: 0 16px 8px;
    }
    .cenbot-qr {
      background: transparent;
      border: 1px solid rgba(0,114,255,0.5);
      color: #5eb0ff;
      font-family: 'Sora', sans-serif;
      font-size: 11.5px;
      padding: 5px 11px;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .cenbot-qr:hover {
      background: rgba(0,114,255,0.15);
      border-color: #0072ff;
      color: white;
    }

    /* Input */
    .cenbot-inputarea {
      padding: 12px 14px;
      border-top: 1px solid rgba(255,255,255,0.06);
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .cenbot-input {
      flex: 1;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 24px;
      padding: 9px 16px;
      color: #e8ecf4;
      font-family: 'Sora', sans-serif;
      font-size: 13px;
      outline: none;
      transition: border-color 0.2s;
    }
    .cenbot-input::placeholder { color: rgba(255,255,255,0.3); }
    .cenbot-input:focus { border-color: rgba(0,114,255,0.6); }
    .cenbot-send {
      width: 38px; height: 38px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0072ff, #0050b8);
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .cenbot-send:hover { transform: scale(1.1); box-shadow: 0 4px 14px rgba(0,114,255,0.5); }
    .cenbot-send svg { width: 16px; height: 16px; fill: white; }

    /* Branding */
    .cenbot-brand {
      text-align: center;
      font-size: 10px;
      color: rgba(255,255,255,0.2);
      padding: 4px 0 8px;
    }

    @media (max-width: 480px) {
      #cenbot-window {
        right: 12px;
        left: 12px;
        width: auto;
        bottom: calc(var(--fab-bottom, .9rem) + (var(--fab-size, 58px) * 2) + (var(--fab-gap, 14px) * 2));
      }
    }
  `;
  document.head.appendChild(style);

  // ============================================================
  // 🏗️ HTML DEL CHATBOT
  // ============================================================
  const btn = document.createElement('button');
  btn.id = 'cenbot-btn';
  btn.setAttribute('aria-label', 'Abrir CenBot');
  btn.innerHTML = `
    <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
    <span class="cenbot-badge"></span>
  `;

  const win = document.createElement('div');
  win.id = 'cenbot-window';
  win.innerHTML = `
    <div class="cenbot-header">
      <div class="cenbot-avatar">🤖</div>
      <div class="cenbot-info">
        <div class="cenbot-name">CenBot · Adaptia</div>
        <div class="cenbot-status"><span class="cenbot-dot"></span> En línea ahora</div>
      </div>
      <button class="cenbot-close" aria-label="Cerrar">✕</button>
    </div>
    <div class="cenbot-messages" id="cenbot-messages"></div>
    <div class="cenbot-quickreplies" id="cenbot-qr"></div>
    <div class="cenbot-inputarea">
      <input class="cenbot-input" id="cenbot-input" type="text" placeholder="Escribe tu pregunta…" autocomplete="off" />
      <button class="cenbot-send" id="cenbot-send" aria-label="Enviar">
        <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
      </button>
    </div>
    <div class="cenbot-brand">Powered by IA · Adaptia Consultoría</div>
  `;

  document.body.appendChild(btn);
  document.body.appendChild(win);

  // ============================================================
  // ⚙️ LÓGICA DEL CHATBOT
  // ============================================================
  const messagesEl = document.getElementById('cenbot-messages');
  const inputEl = document.getElementById('cenbot-input');
  const sendBtn = document.getElementById('cenbot-send');
  const qrEl = document.getElementById('cenbot-qr');

  let isOpen = false;
  let isLoading = false;
  let conversationHistory = [];

  const quickReplies = [
    '¿Qué hace Adaptia?',
    '¿Cuáles son los paquetes?',
    '¿Cuánto cuesta?',
    '¿Cómo empiezo?',
  ];

  function toggleChat() {
    isOpen = !isOpen;
    win.classList.toggle('open', isOpen);
    if (isOpen && messagesEl.children.length === 0) {
      showWelcome();
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: isOpen ? 'cenbot_open' : 'cenbot_close' });
  }

  function showWelcome() {
    appendMessage('bot', '¡Hola! 👋 Soy **CenBot**, el asistente de Adaptia Consultoría. Estoy aquí para ayudarte a conocer cómo podemos digitalizar tu negocio automotriz. ¿En qué te puedo ayudar?');
    renderQuickReplies();
  }

  function renderQuickReplies() {
    qrEl.innerHTML = '';
    quickReplies.forEach(q => {
      const btn = document.createElement('button');
      btn.className = 'cenbot-qr';
      btn.textContent = q;
      btn.addEventListener('click', () => {
        qrEl.innerHTML = '';
        sendMessage(q);
      });
      qrEl.appendChild(btn);
    });
  }

  function appendMessage(role, text) {
    const div = document.createElement('div');
    div.className = `cenbot-msg ${role}`;
    // Simple markdown bold support
    div.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'cenbot-typing';
    div.id = 'cenbot-typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    const t = document.getElementById('cenbot-typing');
    if (t) t.remove();
  }


  async function requestFromWorker(messages) {
    let lastError = null;

    for (const url of WORKER_URLS) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages })
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`HTTP ${response.status} (${url}) ${errorBody.slice(0, 120)}`);
        }

        return response.json();
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error('No se pudo conectar a ningún endpoint del Worker');
  }

  async function sendMessage(text) {
    if (!text.trim() || isLoading) return;
    qrEl.innerHTML = '';
    appendMessage('user', text);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'cenbot_message_sent' });
    conversationHistory.push({ role: 'user', content: text });
    inputEl.value = '';
    isLoading = true;
    showTyping();

    try {
      // Construir mensajes con el system prompt incluido
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...conversationHistory
      ];

      // Llamar al Cloudflare Worker (la clave de Groq está segura allá)
      const data = await requestFromWorker(messages);

      if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));

      const reply = data.choices?.[0]?.message?.content;
      if (!reply) throw new Error('Respuesta vacía del servidor');

      conversationHistory.push({ role: 'assistant', content: reply });
      hideTyping();
      appendMessage('bot', reply);

    } catch (err) {
      hideTyping();
      const isNetwork = err.message === 'Failed to fetch' || err.name === 'TypeError';
      const workerHint = err.message?.includes('GROQ_API_KEY')
        ? ' Detecté que falta la variable GROQ_API_KEY en Cloudflare Worker.'
        : '';
      const msg = isNetwork
        ? '⚠️ No pude conectarme al servidor. Revisa que el Worker esté publicado y que el dominio esté permitido en CORS.'
        : `😅 Hubo un problema al procesar tu mensaje.${workerHint} También puedes contactarnos en la sección de contacto.`;
      appendMessage('bot', msg);
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'cenbot_error', error_message: String(err.message || 'unknown') });
      console.error('CenBot error:', err.message);
    }

    isLoading = false;
  }

  // Event listeners
  btn.addEventListener('click', toggleChat);
  win.querySelector('.cenbot-close').addEventListener('click', toggleChat);
  sendBtn.addEventListener('click', () => sendMessage(inputEl.value));
  inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(inputEl.value); });

})();
