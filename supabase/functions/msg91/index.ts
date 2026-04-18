import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const MSG91_AUTH_KEY = Deno.env.get('MSG91_AUTH_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (!MSG91_AUTH_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[MSG91 Proxy] CRITICAL: Environment variables missing!')
    return new Response(JSON.stringify({ error: 'Server configuration missing' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  try {
    const body = await req.json()
    const { type, mobile, otp, customerId, cid, subscription, balance, date } = body
    
    console.log(`[MSG91 Proxy] Action: ${type}, Mobile: ${mobile}`)

    const TEMPLATES = {
      OTP: '60dd634f76297c6d9859b4e2',
      REGISTRATION: '60defad58575d253c8315b35',
      DELIVERY: '608a3efc3d5a91579c4e001d',
    }
    const DLT_IDS = {
      OTP: '1707162247758976948',
      REGISTRATION: '1707162512095564728',
      DELIVERY: '1707161856692885981',
    }
    const SENDER_ID = 'ASTDAI'

    let url = 'https://control.msg91.com/api/v5/flow/'
    let method = 'POST'
    let payload: any = null

    if (type === 'sendOtp') {
      // 1. Generate 6-digit OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString()
      
      // 2. Store in Supabase
      const { error: dbError } = await supabase
        .from('otp_verifications')
        .upsert({ mobile, otp: generatedOtp, created_at: new Date().toISOString() })
      
      if (dbError) throw new Error(`Database error: ${dbError.message}`)

      // 3. Prepare MSG91 Flow payload
      payload = {
        template_id: TEMPLATES.OTP,
        sender: SENDER_ID,
        short_url: '1',
        DLT_TE_ID: DLT_IDS.OTP,
        recipients: [{ mobiles: `91${mobile}`, var: generatedOtp }]
      }
    } else if (type === 'verifyOtp') {
      // 1. Fetch OTP from Supabase
      const { data: dbData, error: dbError } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('mobile', mobile)
        .single()

      if (dbError || !dbData) {
        return new Response(JSON.stringify({ type: 'error', message: 'OTP expired or not found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200, // Return 200 so app can handle the logic
        })
      }

      // 2. Check Expiry (5 minutes)
      const createdAt = new Date(dbData.created_at).getTime()
      const now = new Date().getTime()
      if (now - createdAt > 5 * 60 * 1000) {
        await supabase.from('otp_verifications').delete().eq('mobile', mobile)
        return new Response(JSON.stringify({ type: 'error', message: 'OTP expired' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      // 3. Compare OTP
      if (dbData.otp === otp) {
        await supabase.from('otp_verifications').delete().eq('mobile', mobile)
        return new Response(JSON.stringify({ type: 'success' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      } else {
        return new Response(JSON.stringify({ type: 'error', message: 'Invalid OTP' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }
    } else if (type === 'registration') {
      payload = {
        template_id: TEMPLATES.REGISTRATION,
        sender: SENDER_ID,
        short_url: '1',
        DLT_TE_ID: DLT_IDS.REGISTRATION,
        recipients: [{ mobiles: `91${mobile}`, var: customerId }]
      }
    } else if (type === 'delivery') {
      payload = {
        template_id: TEMPLATES.DELIVERY,
        sender: SENDER_ID,
        short_url: '1',
        DLT_TE_ID: DLT_IDS.DELIVERY,
        recipients: [{
          mobiles: `91${mobile}`,
          var1: cid,
          var2: subscription,
          var3: balance.toString(),
          var4: date
        }]
      }
    }

    if (!payload && type !== 'verifyOtp') throw new Error('Invalid request')

    // If verifyOtp, we already returned. For others, call MSG91.
    if (payload) {
      console.log(`[MSG91 Proxy] Calling Flow API for ${type}`)
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'authkey': MSG91_AUTH_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()
      console.log(`[MSG91 Proxy] MSG91 Result:`, result)
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

  } catch (error: any) {
    console.error(`[MSG91 Proxy] Error: ${error.message}`)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
