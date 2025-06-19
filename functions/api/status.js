// KV存储状态检查API
// 访问路径: /api/status

export async function onRequestGet(context) {
  const { env } = context;
  
  try {
    // 测试KV存储连接
    const testKey = 'health_check';
    const testValue = {
      timestamp: new Date().toISOString(),
      status: 'healthy'
    };
    
    // 写入测试数据
    await env.HONGQINGTING_KV.put(testKey, JSON.stringify(testValue));
    
    // 读取测试数据
    const retrievedValue = await env.HONGQINGTING_KV.get(testKey, 'json');
    
    // 获取todos统计信息
    const todosData = await env.HONGQINGTING_KV.get('todos', 'json');
    const todos = todosData || [];
    const completedCount = todos.filter(todo => todo.completed).length;
    
    return new Response(JSON.stringify({
      success: true,
      kv_status: 'connected',
      test_write: testValue,
      test_read: retrievedValue,
      todos_stats: {
        total: todos.length,
        completed: completedCount,
        pending: todos.length - completedCount
      },
      environment: env.ENVIRONMENT || 'unknown',
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      kv_status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// 清空所有数据的端点（仅用于开发测试）
export async function onRequestDelete(context) {
  const { env } = context;
  
  try {
    // 清空todos数据
    await env.HONGQINGTING_KV.put('todos', JSON.stringify([]));
    
    // 删除健康检查数据
    await env.HONGQINGTING_KV.delete('health_check');
    
    return new Response(JSON.stringify({
      success: true,
      message: '所有KV数据已清空',
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// 处理OPTIONS请求（CORS预检）
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}