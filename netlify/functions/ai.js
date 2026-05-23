exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const { messages, subject } = JSON.parse(event.body || '{}')
  const key = process.env.GROQ_API_KEY

  if (!key) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) }
  }

  const systemPrompt = `أنت مساعد ذكاء اصطناعي أكاديمي متخصص في ${subject || 'الهندسة الإلكترونية'}. 
تعمل لدى قسم تقنيات هندسة الإلكترونيك والذكاء الاصطناعي، كلية البوليتكنك للتخصصات الهندسية، الجامعة التقنية الوسطى.
أجب بدقة تقنية عالية، استخدم المعادلات والأمثلة العملية، وكن واضحاً وموجزاً.`

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        temperature: 0.3,
        max_tokens: 1024,
      }),
    })

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content || 'لا يوجد رد'
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
