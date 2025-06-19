<template>
  <div id="app">
    <header class="header">
      <div class="container">
        <h1 class="logo">🌸 红蜻蜓</h1>
        <nav class="nav">
          <a href="#home" class="nav-link">首页</a>
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
          </div>
        </div>
      </section>

      <!-- 时间管理功能区 -->
      <section id="time-management" class="time-section">
        <div class="container">
          <h3 class="section-title">⏰ 时间管理</h3>
          <p class="section-subtitle">选择时间段并上传二维码</p>
          
          <!-- 时间按钮列表 -->
          <div class="time-buttons-list">
            <div 
              v-for="timeOption in timeOptions" 
              :key="timeOption.id" 
              class="time-item"
            >
              <div class="time-content">
                <button 
                  @click="selectTime(timeOption.id)"
                  class="btn time-btn"
                  :class="{ active: selectedTime === timeOption.id }"
                >
                  {{ timeOption.label }}
                </button>
                
                <div class="upload-section">
                  <input 
                    type="file" 
                    :id="'file-' + timeOption.id"
                    @change="handleFileUpload($event, timeOption.id)"
                    accept="image/*"
                    class="file-input"
                    style="display: none;"
                  >
                  <button 
                    @click="triggerFileUpload(timeOption.id)"
                    class="btn btn-upload"
                    :disabled="loading"
                  >
                    📷 上传二维码
                  </button>
                </div>
                
                <div class="update-time">
                  <span class="time-label">最后更新:</span>
                  <span class="time-value">{{ formatUpdateTime(timeOption.lastUpdate) }}</span>
                </div>
              </div>
              
              <!-- 显示已上传的二维码 -->
              <div v-if="timeOption.qrCode" class="qr-preview">
                <img :src="timeOption.qrCode" alt="二维码" class="qr-image">
                <button 
                  @click="removeQRCode(timeOption.id)"
                  class="btn btn-remove"
                >
                  ❌ 删除
                </button>
              </div>
            </div>
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
      loading: false,
      kvStatus: null,
      selectedTime: null,
      timeOptions: [
        {
          id: '2h',
          label: '2小时',
          qrCode: null,
          lastUpdate: null
        },
        {
          id: '4h',
          label: '4小时',
          qrCode: null,
          lastUpdate: null
        },
        {
          id: '6h',
          label: '6小时',
          qrCode: null,
          lastUpdate: null
        }
      ]
    }
  },
  mounted() {
    this.loadTimeData()
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
    
    loadTimeData() {
      // 从本地存储加载时间数据
      const stored = localStorage.getItem('hongqingting_time_data')
      if (stored) {
        const timeData = JSON.parse(stored)
        this.timeOptions.forEach(option => {
          const savedData = timeData[option.id]
          if (savedData) {
            option.qrCode = savedData.qrCode
            option.lastUpdate = savedData.lastUpdate
          }
        })
      }
    },
    
    saveTimeData() {
      // 保存时间数据到本地存储
      const timeData = {}
      this.timeOptions.forEach(option => {
        timeData[option.id] = {
          qrCode: option.qrCode,
          lastUpdate: option.lastUpdate
        }
      })
      localStorage.setItem('hongqingting_time_data', JSON.stringify(timeData))
    },
    
    selectTime(timeId) {
      this.selectedTime = timeId
    },
    
    triggerFileUpload(timeId) {
      const fileInput = document.getElementById('file-' + timeId)
      fileInput.click()
    },
    
    handleFileUpload(event, timeId) {
      const file = event.target.files[0]
      if (!file) return
      
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件')
        return
      }
      
      // 检查文件大小（限制为5MB）
      if (file.size > 5 * 1024 * 1024) {
        alert('文件大小不能超过5MB')
        return
      }
      
      this.loading = true
      
      // 使用FileReader读取文件
      const reader = new FileReader()
      reader.onload = (e) => {
        const timeOption = this.timeOptions.find(option => option.id === timeId)
        if (timeOption) {
          timeOption.qrCode = e.target.result
          timeOption.lastUpdate = new Date().toISOString()
          this.saveTimeData()
        }
        this.loading = false
      }
      
      reader.onerror = () => {
        alert('文件读取失败')
        this.loading = false
      }
      
      reader.readAsDataURL(file)
      
      // 清空input值，允许重复选择同一文件
      event.target.value = ''
    },
    
    removeQRCode(timeId) {
      if (!confirm('确定要删除这个二维码吗？')) return
      
      const timeOption = this.timeOptions.find(option => option.id === timeId)
      if (timeOption) {
        timeOption.qrCode = null
        timeOption.lastUpdate = new Date().toISOString()
        this.saveTimeData()
      }
    },
    
    formatUpdateTime(dateString) {
      if (!dateString) return '未更新'
      
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now - date
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)
      
      if (diffMins < 1) {
        return '刚刚'
      } else if (diffMins < 60) {
        return `${diffMins}分钟前`
      } else if (diffHours < 24) {
        return `${diffHours}小时前`
      } else if (diffDays < 7) {
        return `${diffDays}天前`
      } else {
        return date.toLocaleDateString('zh-CN', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
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

/* 时间管理区域 */
.time-section {
  padding: 4rem 0;
  background: #f8f9fa;
}

.section-subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 3rem;
  font-size: 1.1rem;
}

/* 时间按钮列表 */
.time-buttons-list {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.time-item {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: all 0.3s;
}

.time-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

.time-content {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.time-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 32px;
  border: none;
  border-radius: 25px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 120px;
}

.time-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.time-btn.active {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 6px 16px rgba(245, 87, 108, 0.4);
}

.upload-section {
  display: flex;
  align-items: center;
}

.btn-upload {
  background: #10b981;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-upload:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
}

.btn-upload:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.update-time {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: auto;
}

.time-label {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.time-value {
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
}

/* 二维码预览 */
.qr-preview {
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #e1e5e9;
}

.qr-image {
  width: 120px;
  height: 120px;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid #e1e5e9;
}

.btn-remove {
  background: #ef4444;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-remove:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.file-input {
  display: none;
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
  
  .time-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .time-btn {
    width: 100%;
    text-align: center;
  }
  
  .update-time {
    margin-left: 0;
    align-items: center;
    text-align: center;
  }
  
  .qr-preview {
    flex-direction: column;
    text-align: center;
  }
  
  .qr-image {
    width: 100px;
    height: 100px;
  }
}
</style>