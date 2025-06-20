// 获取KV中存储的真实地址数据
export async function onRequestGet(context) {
  const { request, env } = context;
  
  try {
    const url = new URL(request.url);
    const timeId = url.searchParams.get('timeId');
    
    // 如果指定了timeId，只返回该时间段的数据
    if (timeId) {
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
      
      // 查找指定时间段的最新真实地址数据
      const realUrlData = await findLatestRealUrl(env, timeId);
      
      return new Response(JSON.stringify({
        success: true,
        timeId: timeId,
        data: realUrlData
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }
    
    // 如果没有指定timeId，返回所有时间段的最新数据
    const allData = {};
    const timeIds = ['2h', '4h', '6h'];
    
    for (const id of timeIds) {
      const realUrlData = await findLatestRealUrl(env, id);
      allData[id] = realUrlData;
    }
    
    return new Response(JSON.stringify({
      success: true,
      data: allData
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
    
  } catch (error) {
    console.error('获取真实地址数据失败:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
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

// 查找指定时间段的最新真实地址数据
async function findLatestRealUrl(env, timeId) {
  try {
    // 获取当前的URL数据（键名格式：url_2h）
    const currentKey = `url_${timeId}`;
    const currentData = await env.HONGQINGTING_KV.get(currentKey);
    
    if (currentData) {
      const parsedData = JSON.parse(currentData);
      return {
        key: currentKey,
        originalUrl: parsedData.url, // 注意这里字段名是url而不是originalUrl
        finalUrl: parsedData.url,
        redirectCount: 0, // 当前数据没有重定向信息
        timestamp: parsedData.timestamp,
        expireTime: null // 当前数据没有过期时间
      };
    }
    
    return null;
  } catch (error) {
    console.error(`查找 ${timeId} 真实地址数据失败:`, error);
    return null;
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