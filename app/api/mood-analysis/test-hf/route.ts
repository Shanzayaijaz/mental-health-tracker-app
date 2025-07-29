import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const hfApiKey = process.env.HUGGING_FACE_API_KEY;
    
    if (!hfApiKey) {
      return NextResponse.json({
        error: 'Hugging Face API key not found',
        status: 'missing_key'
      }, { status: 500 });
    }

    console.log('Testing Hugging Face API...');
    
                    // Test with a more reliable model
                const response = await fetch(
                  'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
                  {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${hfApiKey}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      inputs: 'Hello, how are you?',
                      parameters: {
                        max_length: 50,
                        temperature: 0.7,
                        do_sample: true,
                        return_full_text: false
                      }
                    })
                  }
                );

    console.log('HF API Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('HF API Error:', errorText);
      return NextResponse.json({
        error: 'Hugging Face API call failed',
        status: response.status,
        details: errorText
      }, { status: 500 });
    }

    const result = await response.json();
    console.log('HF API Success:', result);

    return NextResponse.json({
      success: true,
      message: 'Hugging Face API is working',
      result: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test HF API error:', error);
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 