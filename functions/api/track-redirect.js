// 跟踪URL重定向的API端点
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
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }
    
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
    
    return new Response(JSON.stringify({
      success: true,
      originalUrl: url,
      finalUrl: finalUrl,
      redirectCount: redirectCount
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
    
  } catch (error) {
    console.error('处理请求失败:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}