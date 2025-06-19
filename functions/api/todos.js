// Cloudflare Pages Functions API endpoint for KV storage
// 访问路径: /api/todos

export async function onRequestGet(context) {
  const { env } = context;
  
  try {
    // 从KV存储中获取所有todos
    const todosData = await env.HONGQINGTING_KV.get('todos', 'json');
    const todos = todosData || [];
    
    return new Response(JSON.stringify({
      success: true,
      data: todos,
      count: todos.length
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    const { text } = body;
    
    if (!text || text.trim() === '') {
      return new Response(JSON.stringify({
        success: false,
        error: '待办事项内容不能为空'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // 获取现有的todos
    const existingTodos = await env.HONGQINGTING_KV.get('todos', 'json') || [];
    
    // 创建新的todo项
    const newTodo = {
      id: Date.now().toString(),
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    // 添加到列表
    const updatedTodos = [...existingTodos, newTodo];
    
    // 保存到KV存储
    await env.HONGQINGTING_KV.put('todos', JSON.stringify(updatedTodos));
    
    return new Response(JSON.stringify({
      success: true,
      data: newTodo,
      message: '待办事项添加成功'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export async function onRequestPut(context) {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    const { id, completed } = body;
    
    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: '缺少待办事项ID'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // 获取现有的todos
    const existingTodos = await env.HONGQINGTING_KV.get('todos', 'json') || [];
    
    // 更新指定的todo项
    const updatedTodos = existingTodos.map(todo => {
      if (todo.id === id) {
        return {
          ...todo,
          completed: completed !== undefined ? completed : todo.completed,
          updatedAt: new Date().toISOString()
        };
      }
      return todo;
    });
    
    // 保存到KV存储
    await env.HONGQINGTING_KV.put('todos', JSON.stringify(updatedTodos));
    
    const updatedTodo = updatedTodos.find(todo => todo.id === id);
    
    return new Response(JSON.stringify({
      success: true,
      data: updatedTodo,
      message: '待办事项更新成功'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: '缺少待办事项ID'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // 获取现有的todos
    const existingTodos = await env.HONGQINGTING_KV.get('todos', 'json') || [];
    
    // 删除指定的todo项
    const updatedTodos = existingTodos.filter(todo => todo.id !== id);
    
    // 保存到KV存储
    await env.HONGQINGTING_KV.put('todos', JSON.stringify(updatedTodos));
    
    return new Response(JSON.stringify({
      success: true,
      message: '待办事项删除成功'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}