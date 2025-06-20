// 跟踪URL重定向的API端点
// 处理GET请求
export async function onRequestGet(context) {
  const { request, env } = context;
  
  try {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');
    const duration = url.searchParams.get('duration') || 'all';
    
    if (!targetUrl) {
      return new Response(JSON.stringify({
        success: false,
        error: '缺少URL参数'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }
    
    return await trackRedirect(targetUrl, env, duration);
  } catch (error) {
    console.error('处理GET请求失败:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }
}

// 处理POST请求
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { url, duration } = await request.json();
    
    if (!url) {
      return new Response(JSON.stringify({
        success: false,
        error: '缺少URL参数'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }
    
    return await trackRedirect(url, env, duration);
  } catch (error) {
    console.error('处理POST请求失败:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }
}

// 处理URL并存储到KV
async function trackRedirect(url, env, duration = 'all') {
  try {
    console.log('处理URL:', url);
    
    // 直接使用传入的URL作为最终URL（后端已经处理了重定向）
    const finalUrl = url;
    const redirectCount = 0; // 不再进行重定向跟踪
    
    // 将真实地址按不同过期时间存储到KV
    const currentTime = new Date().toISOString();
    const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    
    const urlData = {
      originalUrl: url,
      finalUrl: finalUrl,
      redirectCount: redirectCount,
      timestamp: currentTime,
      expireTime: oneYearFromNow
    };
    
    try {
      const storedKeys = [];
      const kvResults = [];
      
      console.log('开始存储到KV，duration:', duration);
      console.log('KV实例是否存在:', !!env.HONGQINGTING_KV);
      console.log('要存储的数据:', JSON.stringify(urlData));
      
      // 根据duration参数决定存储哪些KV
      if (duration === 'all' || duration === '2h') {
        // 存储2小时过期的数据
        const key2h = 'real_url_2h';
        console.log('准备存储2小时数据，key:', key2h);
        try {
          await env.HONGQINGTING_KV.put(key2h, JSON.stringify(urlData), {
            expirationTtl: 2 * 60 * 60 // 2小时
          });
          storedKeys.push(key2h);
          kvResults.push({ key: key2h, success: true });
          console.log('2小时数据存储成功');
          
          // 验证存储是否成功
          const verifyData = await env.HONGQINGTING_KV.get(key2h);
          console.log('验证2小时数据存储:', verifyData ? '成功读取' : '读取失败');
        } catch (e) {
          console.error('存储2小时数据失败:', e);
          kvResults.push({ key: key2h, success: false, error: e.message });
        }
      }
      
      if (duration === 'all' || duration === '4h') {
        // 存储4小时过期的数据
        const key4h = 'real_url_4h';
        console.log('准备存储4小时数据，key:', key4h);
        try {
          await env.HONGQINGTING_KV.put(key4h, JSON.stringify(urlData), {
            expirationTtl: 4 * 60 * 60 // 4小时
          });
          storedKeys.push(key4h);
          kvResults.push({ key: key4h, success: true });
          console.log('4小时数据存储成功');
          
          // 验证存储是否成功
          const verifyData = await env.HONGQINGTING_KV.get(key4h);
          console.log('验证4小时数据存储:', verifyData ? '成功读取' : '读取失败');
        } catch (e) {
          console.error('存储4小时数据失败:', e);
          kvResults.push({ key: key4h, success: false, error: e.message });
        }
      }
      
      if (duration === 'all' || duration === '6h') {
         // 存储6小时过期的数据
         const key6h = 'real_url_6h';
         console.log('准备存储6小时数据，key:', key6h);
         try {
           await env.HONGQINGTING_KV.put(key6h, JSON.stringify(urlData), {
             expirationTtl: 6 * 60 * 60 // 6小时
           });
           storedKeys.push(key6h);
           kvResults.push({ key: key6h, success: true });
           console.log('6小时数据存储成功');
           
           // 验证存储是否成功
           const verifyData = await env.HONGQINGTING_KV.get(key6h);
           console.log('验证6小时数据存储:', verifyData ? '成功读取' : '读取失败');
         } catch (e) {
           console.error('存储6小时数据失败:', e);
           kvResults.push({ key: key6h, success: false, error: e.message });
         }
       }
      
      console.log('KV存储完成，成功的keys:', storedKeys);
      console.log('KV存储详细结果:', kvResults);
    } catch (kvError) {
      console.error('KV存储过程中发生错误:', kvError);
      console.error('错误堆栈:', kvError.stack);
      // 即使KV存储失败，也继续返回结果
    }
    
    const responseData = {
      success: true,
      originalUrl: url,
      finalUrl: finalUrl,
      redirectCount: redirectCount,
      expireTime: oneYearFromNow,
      storedAt: currentTime,
      environment: env.ENVIRONMENT || 'unknown',
      debug: {
        hasKV: !!env.HONGQINGTING_KV,
        timestamp: Date.now()
      }
    };
    
    console.log('返回响应数据:', responseData);
    
    return new Response(JSON.stringify(responseData), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
    
  } catch (error) {
    console.error('跟踪重定向失败:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }
}

// 处理CORS预检请求
export async function onRequestOptions(context) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}