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
    // 列出所有以 real_url_{timeId}_ 开头的键
    const prefix = `real_url_${timeId}_`;
    const list = await env.HONGQINGTING_KV.list({ prefix });
    
    if (!list.keys || list.keys.length === 0) {
      return null;
    }
    
    // 按时间戳排序，获取最新的数据
    const sortedKeys = list.keys.sort((a, b) => {
      // 从键名中提取时间戳
      const timestampA = extractTimestamp(a.name);
      const timestampB = extractTimestamp(b.name);
      return timestampB - timestampA; // 降序排列，最新的在前
    });
    
    if (sortedKeys.length > 0) {
      const latestKey = sortedKeys[0].name;
      const data = await env.HONGQINGTING_KV.get(latestKey);
      
      if (data) {
        const parsedData = JSON.parse(data);
        return {
          key: latestKey,
          originalUrl: parsedData.originalUrl,
          finalUrl: parsedData.finalUrl,
          redirectCount: parsedData.redirectCount,
          timestamp: parsedData.timestamp,
          expireTime: parsedData.expireTime
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error(`查找 ${timeId} 真实地址数据失败:`, error);
    return null;
  }
}

// 从键名中提取时间戳
function extractTimestamp(keyName) {
  // 键名格式: real_url_{timeId}_{timestamp}_{randomString}
  const parts = keyName.split('_');
  if (parts.length >= 4) {
    return parseInt(parts[3]) || 0;
  }
  return 0;
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