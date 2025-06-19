// 保存URL到KV存储的API端点
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { timeId, url, timestamp } = await request.json();
    
    if (!timeId || !url) {
      return new Response(JSON.stringify({
        success: false,
        error: '缺少必要参数 (timeId, url)'
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
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }
    
    // 验证URL格式
    try {
      new URL(url);
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: '无效的URL格式'
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
    
    // 构造存储的数据
    const urlData = {
      url: url,
      timeId: timeId,
      timestamp: timestamp || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    // 保存到KV存储
    const key = `url_${timeId}`;
    await env.HONGQINGTING_KV.put(key, JSON.stringify(urlData));
    
    // 同时保存一个历史记录
    const historyKey = `url_history_${timeId}_${Date.now()}`;
    await env.HONGQINGTING_KV.put(historyKey, JSON.stringify(urlData), {
      expirationTtl: 30 * 24 * 60 * 60 // 30天后过期
    });
    
    return new Response(JSON.stringify({
      success: true,
      message: 'URL保存成功',
      data: {
        timeId: timeId,
        url: url,
        timestamp: urlData.timestamp
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
    
  } catch (error) {
    console.error('保存URL失败:', error);
    
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