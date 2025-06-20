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
      console.log('开始跟踪重定向:', url);
      while (redirectCount < maxRedirects) {
        console.log(`第${redirectCount + 1}次请求:`, finalUrl);
        
        const response = await fetch(finalUrl, {
          method: 'HEAD', // 使用HEAD请求减少数据传输
          redirect: 'manual',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; RedirectTracker/1.0)'
          },
          // 添加超时控制
          signal: AbortSignal.timeout(10000) // 10秒超时
        });
        
        console.log(`响应状态: ${response.status}`);
        
        if (response.status >= 300 && response.status < 400) {
          const location = response.headers.get('Location');
          console.log('重定向到:', location);
          
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
            console.log(`重定向次数: ${redirectCount}, 新地址: ${finalUrl}`);
          } else {
            console.log('没有Location头部，停止重定向');
            break;
          }
        } else {
          console.log('非重定向响应，停止跟踪');
          break;
        }
      }
      console.log('重定向跟踪完成，最终地址:', finalUrl);
    } catch (error) {
      console.error('跟踪重定向失败:', error.message);
      console.error('错误详情:', error);
      // 如果跟踪失败，返回原始URL
      finalUrl = url;
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
      const key2h = 'real_url_2h';
      await env.HONGQINGTING_KV.put(key2h, JSON.stringify(urlData), {
        expirationTtl: 2 * 60 * 60 // 2小时
      });
      
      // 存储4小时过期的数据
      const key4h = 'real_url_4h';
      await env.HONGQINGTING_KV.put(key4h, JSON.stringify(urlData), {
        expirationTtl: 4 * 60 * 60 // 4小时
      });
      
      // 存储6小时过期的数据
      const key6h = 'real_url_6h';
      await env.HONGQINGTING_KV.put(key6h, JSON.stringify(urlData), {
        expirationTtl: 6 * 60 * 60 // 6小时
      });
      
      console.log('真实地址已存储到KV:', { key2h, key4h, key6h });
    } catch (kvError) {
      console.error('存储到KV失败:', kvError);
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