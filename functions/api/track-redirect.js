// 跟踪URL重定向的API端点
// 处理GET请求
export async function onRequestGet(context) {
  const { request, env } = context;
  
  try {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');
    
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
    
    return await trackRedirect(targetUrl, env);
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
    const { url } = await request.json();
    
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
    
    return await trackRedirect(url, env);
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

// 共用的重定向跟踪逻辑
async function trackRedirect(url, env) {
  try {
    
    // 跟踪重定向链
    let finalUrl = url;
    let redirectCount = 0;
    const maxRedirects = 10; // 防止无限重定向
    
    try {
      while (redirectCount < maxRedirects) {
        const response = await fetch(finalUrl, {
          method: 'GET',
          redirect: 'manual'
        });
        
        if (response.status >= 300 && response.status < 400) {
          const location = response.headers.get('Location');
          if (location) {
            // 处理相对URL
            if (location.startsWith('/')) {
              const urlObj = new URL(finalUrl);
              finalUrl = urlObj.origin + location;
            } else if (location.startsWith('http')) {
              finalUrl = location;
            } else {
              // 相对路径
              const urlObj = new URL(finalUrl);
              finalUrl = new URL(location, urlObj.href).href;
            }
            redirectCount++;
          } else {
            break;
          }
        } else {
          break;
        }
      }
    } catch (error) {
      console.error('跟踪重定向失败:', error);
      // 如果跟踪失败，返回原始URL
    }
    
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
      // 存储2小时过期的数据
      const key2h = `real_url_2h_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await env.HONGQINGTING_KV.put(key2h, JSON.stringify(urlData), {
        expirationTtl: 2 * 60 * 60 // 2小时
      });
      
      // 存储4小时过期的数据
      const key4h = `real_url_4h_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await env.HONGQINGTING_KV.put(key4h, JSON.stringify(urlData), {
        expirationTtl: 4 * 60 * 60 // 4小时
      });
      
      // 存储6小时过期的数据
      const key6h = `real_url_6h_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await env.HONGQINGTING_KV.put(key6h, JSON.stringify(urlData), {
        expirationTtl: 6 * 60 * 60 // 6小时
      });
      
      console.log('真实地址已存储到KV:', { key2h, key4h, key6h });
    } catch (kvError) {
      console.error('存储到KV失败:', kvError);
      // 即使KV存储失败，也继续返回结果
    }
    
    return new Response(JSON.stringify({
      success: true,
      originalUrl: url,
      finalUrl: finalUrl,
      redirectCount: redirectCount,
      expireTime: oneYearFromNow,
      storedAt: currentTime
    }), {
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