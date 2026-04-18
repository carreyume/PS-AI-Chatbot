export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/test-airtable") {
      const result = await fetch("https://api.airtable.com/v0/app7DmMJ9iAnbeVYl/tblPrlzzOx3wUDViO", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.AIRTABLE_API_KEY}`,
        },
        body: JSON.stringify({
          fields: {
            "Timestamp": new Date().toISOString(),
            "Conversation": "TEST",
            "Last Message": "test",
            "Session ID": "debug123"
          }
        })
      });
      const data = await result.json();
      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" }
      });
    }

    if (url.pathname === "/api/chat") {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      }
      if (request.method === "POST") {
        const body = await request.json();
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify(body),
        });
        const data = await res.json();

        const lastMsg = body.messages[body.messages.length - 1]?.content || "";
        const conversation = body.messages
          .map(m => `${m.role.toUpperCase()}: ${m.content}`)
          .join(" | ");

        fetch("https://api.airtable.com/v0/app7DmMJ9iAnbeVYl/tblPrlzzOx3wUDViO", {
          method: "POST",
          headers: {
            "Content-Type": "applicat