// 从KV存储获取URL的API端点
export async function onRequestGet(context) {
  const { request, env } = context;
  
  try {
    const url = new URL(request.url);
    const timeId = url.searchParams.get('timeId');
    
    if (!timeId) {
      return new Response(JSON.stringify({
        success: false,
        error: '缺少timeId参数'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }
    
    // 验证timeId格式
    if (!['2h', '4h', '6h'].includes(timeId)) {
      return new Response(JSON.stringify({
        success: false,
        error: '无效的timeId，必须是 2h, 4h 或 6h'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }
    
    // 从KV存储获取URL
    const key = `url_${timeId}`;
    const storedData = await env.HONGQINGTING_KV.get(key);
    
    if (!storedData) {
      return new Response(JSON.stringify({
        success: false,
        error: '未找到对应的URL',
        url: null
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }
    
    const urlData = JSON.parse(storedData);
    
    return new Response(JSON.stringify({
      success: true,
      url: urlData.url,
      data: {
        timeId: urlData.timeId,
        url: urlData.url,
        timestamp: urlData.timestamp,
        createdAt: urlData.createdAt
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
    
  } catch (error) {
    console.error('获取URL失败:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      url: null
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}