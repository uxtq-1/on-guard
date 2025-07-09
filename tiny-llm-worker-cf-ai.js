// tiny-llm-worker-cf-ai.js
// Cloudflare Worker using Workers AI for LLM interaction.

// --- Configuration ---
// These should be set as environment variables in your Cloudflare Worker settings.
// - RECAPTCHA_SECRET_KEY: Your Google reCAPTCHA v3 secret key.
// - ALLOWED_ORIGIN: The origin URL of your website where the chatbot widget is hosted (e.g., https://yourdomain.com)
//                   This is crucial for CORS and security.

// --- Security Best Practices & Compliance Alignment (NIST, CISA, PCI DSS) ---
// - Least Privilege: The worker only has permissions to execute AI models and fetch (for reCAPTCHA).
// - Input Validation: Validates request methods, content types, and expected data (e.g., message, token). (NIST AC-4, CM-6)
// - Error Handling: Provides generic error messages to the client, logs detailed errors internally. (NIST SI-11)
// - Secure Defaults: CORS policy restricts to known origins.
// - Secret Management: RECAPTCHA_SECRET_KEY and any LLM API keys (for external version) are handled as environment secrets. (NIST SC-28)
// - Rate Limiting & Abuse Prevention: reCAPTCHA helps. Consider Cloudflare Rate Limiting product for DDoS. (NIST SC-5)
// - Logging & Monitoring: Use Cloudflare's built-in logging. For PCI, more extensive logging might be needed. (NIST AU-2, AU-3)
// - HTTPS Only: Cloudflare Workers are served over HTTPS by default. (NIST SC-8)
// - Content Security Policy (CSP) is handled client-side but complements worker security.

const HONEYPOT_ALERT_PATH = '/widget-bot-alert';
const CHATBOT_MESSAGE_PATH = '/chatbot_message_check';

export default {
  async fetch(request, env, ctx) {
    // --- Security: CORS Handling & Allowed Origin ---
    // Ensure ALLOWED_ORIGIN is set in your worker's environment variables.
    const allowedOrigin = env.ALLOWED_ORIGIN || '*'; // Default to '*' if not set, but specific origin is STRONGLY recommended.
    if (allowedOrigin === '*') {
        console.warn("WARN: ALLOWED_ORIGIN is not set or is '*'. For production, specify your website's origin for security.");
    }

    const corsHeaders = {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // --- Security: Basic Request Validation ---
    if (request.method !== 'POST') {
      return new Response('Invalid request method. Only POST is accepted.', { status: 405, headers: corsHeaders });
    }

    const { pathname } = new URL(request.url);

    try {
      if (pathname === HONEYPOT_ALERT_PATH) {
        // --- Endpoint: /widget-bot-alert ---
        // Logs potential bot activity detected by the client-side honeypot.
        // NIST AU-2: Event Logging
        const alertData = await request.json();
        console.log('Honeypot Alert Received:', JSON.stringify(alertData));
        // In a real scenario, you might send this to a dedicated logging/alerting system.
        return new Response(JSON.stringify({ success: true, message: 'Alert logged' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else if (pathname === CHATBOT_MESSAGE_PATH) {
        // --- Endpoint: /chatbot_message_check ---
        // Handles user messages, verifies reCAPTCHA, and interacts with LLM.

        // --- Security: Content-Type Validation (NIST CM-6) ---
        if (request.headers.get('Content-Type') !== 'application/json') {
          return new Response(JSON.stringify({ success: false, message: 'Invalid Content-Type. Expected application/json.' }), {
            status: 415,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { message, recaptchaToken } = await request.json();

        // --- Security: Input Validation (NIST AC-4, SC-3) ---
        if (!message || typeof message !== 'string' || message.trim() === '') {
          return new Response(JSON.stringify({ success: false, message: 'Message is required.' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        if (!recaptchaToken) {
          return new Response(JSON.stringify({ success: false, message: 'reCAPTCHA token is required.' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // --- Security: reCAPTCHA Verification (NIST IA-2, IA-8) ---
        // RECAPTCHA_SECRET_KEY must be set as an environment variable in the worker.
        if (!env.RECAPTCHA_SECRET_KEY) {
            console.error("CRITICAL: RECAPTCHA_SECRET_KEY is not set in worker environment.");
            return new Response(JSON.stringify({ success: false, message: 'Server configuration error.' }), {
                status: 500, // Internal Server Error
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }
        const recaptchaVerified = await verifyRecaptcha(recaptchaToken, env.RECAPTCHA_SECRET_KEY, request.headers.get('cf-connecting-ip'));
        if (!recaptchaVerified) {
          return new Response(JSON.stringify({ success: false, message: 'reCAPTCHA verification failed.' }), {
            status: 403, // Forbidden
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // --- LLM Interaction (Cloudflare Workers AI) ---
        // NIST SC-22: System and Communications Protection - Using trusted communication channels
        // Ensure the AI model selected aligns with data sensitivity requirements.
        try {
          const aiResponse = await env.AI.run('@cf/meta/llama-2-7b-chat-fp16', {
            prompt: message, // Or structure as per Llama2 prompt engineering best practices
            // Example for Llama2 chat model structure:
            // messages: [
            //   { role: 'system', content: 'You are a helpful assistant named Chattia.' },
            //   { role: 'user', content: message }
            // ]
          });

          // The actual response structure from Workers AI might vary.
          // This is a common structure for text generation models.
          const llmReply = aiResponse.response || "I'm sorry, I couldn't generate a response.";

          return new Response(JSON.stringify({ success: true, message: llmReply }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        } catch (llmError) {
          console.error('LLM (Workers AI) Error:', llmError);
          // NIST SI-11: Error Handling - Log error, provide generic message to user.
          return new Response(JSON.stringify({ success: false, message: 'Error communicating with AI service.' }), {
            status: 503, // Service Unavailable
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } else {
        return new Response('Not Found', { status: 404, headers: corsHeaders });
      }
    } catch (error) {
      console.error('Unhandled Worker Error:', error);
      // NIST SI-11: Error Handling
      return new Response(JSON.stringify({ success: false, message: 'An unexpected error occurred.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};

async function verifyRecaptcha(token, secretKey, clientIp) {
  // PCI DSS Req 6.5.10: Broken Authentication and Session Management
  // Verifying reCAPTCHA server-side is crucial.
  const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';
  const formData = new URLSearchParams();
  formData.append('secret', secretKey);
  formData.append('response', token);
  if (clientIp) {
    formData.append('remoteip', clientIp);
  }

  try {
    const response = await fetch(verificationUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    const result = await response.json();
    // console.log('reCAPTCHA verification result:', JSON.stringify(result)); // For debugging, can be noisy
    // NIST IA-5: Authenticator Management - Checking reCAPTCHA score if available and applicable.
    // For v3, you might check result.score > threshold (e.g., 0.5)
    return result.success;
  } catch (error) {
    console.error('reCAPTCHA API request failed:', error);
    return false;
  }
}
