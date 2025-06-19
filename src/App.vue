<template>
  <div id="app">
    <header class="header">
      <div class="container">
        <h1 class="logo">🌸 红蜻蜓</h1>
        <nav class="nav">
          <a href="#home" class="nav-link">首页</a>
          <a href="#todos" class="nav-link">待办事项</a>
          <a href="#about" class="nav-link">关于</a>
        </nav>
      </div>
    </header>

    <main class="main">
      <section class="hero">
        <div class="container">
          <h2 class="hero-title">欢迎来到红蜻蜓</h2>
          <p class="hero-subtitle">基于 Vue.js 构建，集成 Cloudflare KV 存储</p>
          <div class="hero-buttons">
            <button class="btn btn-primary" @click="checkKVStatus">检查KV状态</button>
            <button class="btn btn-secondary" @click="learnMore">了解更多</button>
          </div>
          <div v-if="kvStatus" class="kv-status" :class="kvStatus.success ? 'success' : 'error'">
            <p><strong>KV状态:</strong> {{ kvStatus.success ? '✅ 连接正常' : '❌ 连接失败' }}</p>
            <p v-if="kvStatus.todos_stats"><strong>待办事项:</strong> 总计 {{ kvStatus.todos_stats.total }}，已完成 {{ kvStatus.todos_stats.completed }}</p>
          </div>
        </div>
      </section>

      <!-- 待办事项功能区 -->
      <section id="todos" class="todos-section">
        <div class="container">
          <h3 class="section-title">📝 待办事项管理</h3>
          <p class="section-subtitle">基于 Cloudflare KV 存储的实时待办事项系统</p>
          
          <!-- 添加新待办事项 -->
          <div class="todo-input-section">
            <div class="input-group">
              <input 
                v-model="newTodoText" 
                @keyup.enter="addTodo"
                type="text" 
                placeholder="输入新的待办事项..."
                class="todo-input"
                :disabled="loading"
              >
              <button 
                @click="addTodo" 
                class="btn btn-add"
                :disabled="loading || !newTodoText.trim()"
              >
                {{ loading ? '添加中...' : '添加' }}
              </button>
            </div>
          </div>

          <!-- 待办事项列表 -->
          <div class="todos-list">
            <div v-if="loading && todos.length === 0" class="loading-message">
              正在加载待办事项...
            </div>
            <div v-else-if="todos.length === 0" class="empty-message">
              暂无待办事项，添加一个开始吧！
            </div>
            <div v-else>
              <div 
                v-for="todo in todos" 
                :key="todo.id" 
                class="todo-item"
                :class="{ completed: todo.completed }"
              >
                <div class="todo-content">
                  <input 
                    type="checkbox" 
                    :checked="todo.completed"
                    @change="toggleTodo(todo.id, !todo.completed)"
                    class="todo-checkbox"
                  >
                  <span class="todo-text">{{ todo.text }}</span>
                  <span class="todo-date">{{ formatDate(todo.createdAt) }}</span>
                </div>
                <button 
                  @click="deleteTodo(todo.id)"
                  class="btn btn-delete"
                  :disabled="loading"
                >
                  删除
                </button>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="todo-actions">
            <button @click="loadTodos" class="btn btn-secondary" :disabled="loading">
              {{ loading ? '刷新中...' : '刷新列表' }}
            </button>
            <button @click="clearAllTodos" class="btn btn-danger" :disabled="loading || todos.length === 0">
              清空所有
            </button>
          </div>
        </div>
      </section>

      <section class="features">
        <div class="container">
          <h3 class="section-title">特色功能</h3>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">⚡</div>
              <h4>极速加载</h4>
              <p>基于 Cloudflare 全球 CDN 网络，确保快速访问</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🔒</div>
              <h4>安全可靠</h4>
              <p>自动 HTTPS 加密，保护用户数据安全</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📱</div>
              <h4>响应式设计</h4>
              <p>完美适配各种设备和屏幕尺寸</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="container">
        <p>&copy; 2024 红蜻蜓. 基于 Vue.js 和 Cloudflare Pages 构建</p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      todos: [],
      newTodoText: '',
      loading: false,
      kvStatus: null
    }
  },
  mounted() {
    this.loadTodos()
  },
  methods: {
    async checkKVStatus() {
      this.loading = true
      try {
        const response = await fetch('/api/status')
        const data = await response.json()
        this.kvStatus = data
        
        if (data.success) {
          this.$nextTick(() => {
            setTimeout(() => {
              this.kvStatus = null
            }, 5000)
          })
        }
      } catch (error) {
        console.error('检查KV状态失败:', error)
        this.kvStatus = {
          success: false,
          error: error.message
        }
      } finally {
        this.loading = false
      }
    },
    
    async loadTodos() {
      this.loading = true
      try {
        const response = await fetch('/api/todos')
        const data = await response.json()
        
        if (data.success) {
          this.todos = data.data || []
        } else {
          console.error('加载待办事项失败:', data.error)
          // 在开发环境下，如果API不可用，使用本地存储
          if (window.location.hostname === 'localhost') {
            this.loadLocalTodos()
          }
        }
      } catch (error) {
        console.error('加载待办事项失败:', error)
        // 在开发环境下，如果API不可用，使用本地存储
        if (window.location.hostname === 'localhost') {
          this.loadLocalTodos()
        }
      } finally {
        this.loading = false
      }
    },
    
    async addTodo() {
      if (!this.newTodoText.trim()) return
      
      this.loading = true
      try {
        const response = await fetch('/api/todos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: this.newTodoText.trim()
          })
        })
        
        const data = await response.json()
        
        if (data.success) {
          this.todos.push(data.data)
          this.newTodoText = ''
        } else {
          alert('添加失败: ' + data.error)
          // 开发环境下使用本地存储
          if (window.location.hostname === 'localhost') {
            this.addLocalTodo()
          }
        }
      } catch (error) {
        console.error('添加待办事项失败:', error)
        // 开发环境下使用本地存储
        if (window.location.hostname === 'localhost') {
          this.addLocalTodo()
        }
      } finally {
        this.loading = false
      }
    },
    
    async toggleTodo(id, completed) {
      this.loading = true
      try {
        const response = await fetch('/api/todos', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id,
            completed
          })
        })
        
        const data = await response.json()
        
        if (data.success) {
          const todoIndex = this.todos.findIndex(todo => todo.id === id)
          if (todoIndex !== -1) {
            this.todos[todoIndex] = data.data
          }
        } else {
          alert('更新失败: ' + data.error)
        }
      } catch (error) {
        console.error('更新待办事项失败:', error)
        // 开发环境下使用本地存储
        if (window.location.hostname === 'localhost') {
          this.toggleLocalTodo(id, completed)
        }
      } finally {
        this.loading = false
      }
    },
    
    async deleteTodo(id) {
      if (!confirm('确定要删除这个待办事项吗？')) return
      
      this.loading = true
      try {
        const response = await fetch(`/api/todos?id=${id}`, {
          method: 'DELETE'
        })
        
        const data = await response.json()
        
        if (data.success) {
          this.todos = this.todos.filter(todo => todo.id !== id)
        } else {
          alert('删除失败: ' + data.error)
        }
      } catch (error) {
        console.error('删除待办事项失败:', error)
        // 开发环境下使用本地存储
        if (window.location.hostname === 'localhost') {
          this.deleteLocalTodo(id)
        }
      } finally {
        this.loading = false
      }
    },
    
    async clearAllTodos() {
      if (!confirm('确定要清空所有待办事项吗？此操作不可恢复！')) return
      
      this.loading = true
      try {
        const response = await fetch('/api/status', {
          method: 'DELETE'
        })
        
        const data = await response.json()
        
        if (data.success) {
          this.todos = []
        } else {
          alert('清空失败: ' + data.error)
        }
      } catch (error) {
        console.error('清空待办事项失败:', error)
      } finally {
        this.loading = false
      }
    },
    
    // 本地存储方法（开发环境备用）
    loadLocalTodos() {
      const stored = localStorage.getItem('hongqingting_todos')
      this.todos = stored ? JSON.parse(stored) : []
    },
    
    saveLocalTodos() {
      localStorage.setItem('hongqingting_todos', JSON.stringify(this.todos))
    },
    
    addLocalTodo() {
      const newTodo = {
        id: Date.now().toString(),
        text: this.newTodoText.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      }
      this.todos.push(newTodo)
      this.newTodoText = ''
      this.saveLocalTodos()
    },
    
    toggleLocalTodo(id, completed) {
      const todoIndex = this.todos.findIndex(todo => todo.id === id)
      if (todoIndex !== -1) {
        this.todos[todoIndex].completed = completed
        this.saveLocalTodos()
      }
    },
    
    deleteLocalTodo(id) {
      this.todos = this.todos.filter(todo => todo.id !== id)
      this.saveLocalTodos()
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    learnMore() {
      window.open('https://developers.cloudflare.com/pages/functions/bindings/', '_blank')
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0;
}

.nav {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.3s;
}

.nav-link:hover {
  opacity: 0.8;
}

.main {
  min-height: calc(100vh - 200px);
}

.hero {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 4rem 0;
  text-align: center;
}

.hero-title {
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: bold;
}

.hero-subtitle {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: white;
  color: #f5576c;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background: white;
  color: #f5576c;
}

.features {
  padding: 4rem 0;
  background: #f8f9fa;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: #333;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h4 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

.footer {
  background: #333;
  color: white;
  text-align: center;
  padding: 2rem 0;
}

/* KV状态显示 */
.kv-status {
  margin-top: 2rem;
  padding: 1rem;
  border-radius: 8px;
  text-align: left;
}

.kv-status.success {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #059669;
}

.kv-status.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #dc2626;
}

/* 待办事项区域 */
.todos-section {
  padding: 4rem 0;
  background: #f8f9fa;
}

.section-subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 3rem;
  font-size: 1.1rem;
}

/* 输入区域 */
.todo-input-section {
  margin-bottom: 2rem;
}

.input-group {
  display: flex;
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.todo-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.todo-input:focus {
  outline: none;
  border-color: #667eea;
}

.todo-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.btn-add {
  background: #10b981;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-add:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
}

.btn-add:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

/* 待办事项列表 */
.todos-list {
  max-width: 800px;
  margin: 0 auto 2rem;
}

.loading-message,
.empty-message {
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
}

.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  padding: 1rem 1.5rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.3s;
}

.todo-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.todo-item.completed {
  opacity: 0.7;
}

.todo-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.todo-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.todo-text {
  flex: 1;
  font-size: 1rem;
  color: #333;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: #999;
}

.todo-date {
  font-size: 0.85rem;
  color: #999;
  margin-left: auto;
  margin-right: 1rem;
}

.btn-delete {
  background: #ef4444;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-delete:hover:not(:disabled) {
  background: #dc2626;
}

.btn-delete:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

/* 操作按钮 */
.todo-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
}

.btn-danger:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .header .container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .input-group {
    flex-direction: column;
  }
  
  .todo-item {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .todo-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .todo-date {
    margin: 0;
  }
}
</style>