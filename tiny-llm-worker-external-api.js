// tiny-llm-worker-external-api.js
// Cloudflare Worker using an external API for LLM interaction.

// --- Configuration ---
// These should be set as environment variables in your Cloudflare Worker settings:
// - RECAPTCHA_SECRET_KEY: Your Google reCAPTCHA v3 secret key.
// - EXTERNAL_LLM_API_KEY: API Key for your chosen external LLM provider.
// - EXTERNAL_LLM_API_ENDPOINT: The full URL endpoint for the external LLM API.
// - ALLOWED_ORIGIN: The origin URL of your website (e.g., https://yourdomain.com). Crucial for CORS.

// --- Security Best Practices & Compliance Alignment (NIST, CISA, PCI DSS) ---
// (Similar to the Workers AI version, with emphasis on secure external API calls)
// - Least Privilege: Worker permissions.
// - Input Validation: Request methods, content types, data. (NIST AC-4, CM-6)
// - Error Handling: Generic client messages, detailed internal logs. (NIST SI-11)
// - Secret Management: API keys and secrets via environment variables. (NIST SC-28)
// - Secure External API Calls: Use HTTPS. Validate API responses. (NIST SA-9, SC-8)
// - Rate Limiting & Abuse Prevention: reCAPTCHA. Consider Cloudflare Rate Limiting. (NIST SC-5)
// - Logging & Monitoring: Cloudflare logs. (NIST AU-2, AU-3)

const HONEYPOT_ALERT_PATH = '/widget-bot-alert';
const CHATBOT_MESSAGE_PATH = '/chatbot_message_check';

export default {
  async fetch(request, env, ctx) {
    const allowedOrigin = env.ALLOWED_ORIGIN || '*';
    if (allowedOrigin === '*') {
        console.warn("WARN: ALLOWED_ORIGIN is not set or is '*'. For production, specify your website's origin.");
    }

    const corsHeaders = {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Invalid request method.', { status: 405, headers: corsHeaders });
    }

    const { pathname } = new URL(request.url);

    try {
      if (pathname === HONEYPOT_ALERT_PATH) {
        const alertData = await request.json();
        console.log('Honeypot Alert Received:', JSON.stringify(alertData));
        return new Response(JSON.stringify({ success: true, message: 'Alert logged' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else if (pathname === CHATBOT_MESSAGE_PATH) {
        if (request.headers.get('Content-Type') !== 'application/json') {
          return new Response(JSON.stringify({ success: false, message: 'Invalid Content-Type.' }), {
            status: 415,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { message, recaptchaToken } = await request.json();

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

        if (!env.RECAPTCHA_SECRET_KEY) {
            console.error("CRITICAL: RECAPTCHA_SECRET_KEY is not set.");
            return new Response(JSON.stringify({ success: false, message: 'Server configuration error (reCAPTCHA).' }), {
                status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }
        const recaptchaVerified = await verifyRecaptcha(recaptchaToken, env.RECAPTCHA_SECRET_KEY, request.headers.get('cf-connecting-ip'));
        if (!recaptchaVerified) {
          return new Response(JSON.stringify({ success: false, message: 'reCAPTCHA verification failed.' }), {
            status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // --- External LLM API Interaction ---
        if (!env.EXTERNAL_LLM_API_ENDPOINT || !env.EXTERNAL_LLM_API_KEY) {
            console.error("CRITICAL: External LLM API endpoint or key is not configured.");
            return new Response(JSON.stringify({ success: false, message: 'AI service not configured.' }), {
                status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        try {
          // Example: OpenAI API structure (adjust as per your LLM provider)
          const llmRequestBody = {
            model: "gpt-3.5-turbo", // Or your desired model
            messages: [
              { role: "system", content: "You are Chattia, a helpful AI assistant." },
              { role: "user", content: message }
            ],
            // max_tokens: 150, // Optional: Adjust as needed
          };

          const llmResponse = await fetch(env.EXTERNAL_LLM_API_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${env.EXTERNAL_LLM_API_KEY}`, // Common for many APIs
            },
            body: JSON.stringify(llmRequestBody),
          });

          if (!llmResponse.ok) {
            const errorBody = await llmResponse.text();
            console.error(`External LLM API Error: ${llmResponse.status} ${llmResponse.statusText}`, errorBody);
            throw new Error(`LLM API request failed with status ${llmResponse.status}`);
          }

          const llmData = await llmResponse.json();

          // Adapt this based on the actual structure of your LLM's response
          // For OpenAI, it's often like: llmData.choices[0].message.content
          const llmReply = llmData.choices && llmData.choices[0] && llmData.choices[0].message ?
                           llmData.choices[0].message.content.trim() :
                           "Sorry, I could not extract a valid response from the AI.";

          return new Response(JSON.stringify({ success: true, message: llmReply }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        } catch (llmError) {
          console.error('External LLM API Interaction Error:', llmError);
          return new Response(JSON.stringify({ success: false, message: 'Error communicating with external AI service.' }), {
            status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } else {
        return new Response('Not Found', { status: 404, headers: corsHeaders });
      }
    } catch (error) {
      console.error('Unhandled Worker Error:', error);
      return new Response(JSON.stringify({ success: false, message: 'An unexpected server error occurred.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};

async function verifyRecaptcha(token, secretKey, clientIp) {
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
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const result = await response.json();
    // console.log('reCAPTCHA verification result:', JSON.stringify(result));
    return result.success; // Add score checking for v3 if needed: result.success && result.score > 0.5
  } catch (error) {
    console.error('reCAPTCHA API request failed:', error);
    return false;
  }
}
