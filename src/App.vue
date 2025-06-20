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
                  :class="{ 
                    active: selectedTime === timeOption.id,
                    'has-url': timeOption.savedUrl
                  }"
                >
                  {{ timeOption.label }}
                  <span v-if="timeOption.savedUrl" class="url-indicator">🔗</span>
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
              
              <!-- 显示从KV读取的真实地址信息 -->
              <div v-if="timeOption.realUrlInfo" class="real-url-info">
                <h4 class="real-url-title">📍 真实地址信息</h4>
                <div class="real-url-details">
                  <div class="url-item">
                    <span class="url-label">🅰️ 原始地址:</span>
                    <a :href="timeOption.realUrlInfo.originalUrl" target="_blank" class="url-link">
                      {{ timeOption.realUrlInfo.originalUrl }}
                    </a>
                  </div>
                  <div class="url-item">
                    <span class="url-label">🅱️ 真实地址:</span>
                    <a :href="timeOption.realUrlInfo.finalUrl" target="_blank" class="url-link">
                      {{ timeOption.realUrlInfo.finalUrl }}
                    </a>
                  </div>
                  <div class="url-meta">
                    <span class="meta-item">🔄 重定向次数: {{ timeOption.realUrlInfo.redirectCount }}</span>
                    <span class="meta-item">⏰ 存储时间: {{ formatUpdateTime(timeOption.realUrlInfo.timestamp) }}</span>
                    <span class="meta-item">⏳ 过期时间: {{ formatUpdateTime(timeOption.realUrlInfo.expireTime) }}</span>
                  </div>
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
          lastUpdate: null,
          savedUrl: null,
          realUrlInfo: null
        },
        {
          id: '4h',
          label: '4小时',
          qrCode: null,
          lastUpdate: null,
          savedUrl: null,
          realUrlInfo: null
        },
        {
          id: '6h',
          label: '6小时',
          qrCode: null,
          lastUpdate: null,
          savedUrl: null,
          realUrlInfo: null
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
    
    async loadTimeData() {
      // 从本地存储加载时间数据
      const stored = localStorage.getItem('hongqingting_time_data')
      if (stored) {
        const timeData = JSON.parse(stored)
        this.timeOptions.forEach(option => {
          const savedData = timeData[option.id]
          if (savedData) {
            option.qrCode = savedData.qrCode
            option.lastUpdate = savedData.lastUpdate
            option.savedUrl = savedData.savedUrl
          }
        })
      }
      
      // 自动读取KV中存储的真实地址数据
      await this.loadRealUrlsFromKV()
      
      // 尝试从KV加载URL数据
      for (const option of this.timeOptions) {
        if (!option.savedUrl) {
          try {
            const savedUrl = await this.getUrlFromKV(option.id)
            if (savedUrl) {
              option.savedUrl = savedUrl
            }
          } catch (error) {
            console.error(`加载 ${option.id} 的URL失败:`, error)
          }
        }
      }
      
      // 保存更新后的数据
      this.saveTimeData()
    },
    
    saveTimeData() {
      // 保存时间数据到本地存储
      const timeData = {}
      this.timeOptions.forEach(option => {
        timeData[option.id] = {
          qrCode: option.qrCode,
          lastUpdate: option.lastUpdate,
          savedUrl: option.savedUrl
        }
      })
      localStorage.setItem('hongqingting_time_data', JSON.stringify(timeData))
    },
    
    async selectTime(timeId) {
      this.selectedTime = timeId
      
      // 如果该时间段有保存的URL，则跳转
      const timeOption = this.timeOptions.find(option => option.id === timeId)
      if (timeOption && timeOption.savedUrl) {
        if (confirm(`确定要跳转到 ${timeId} 对应的链接吗？`)) {
          window.open(timeOption.savedUrl, '_blank')
        }
      } else {
        // 尝试从KV获取URL
        try {
          const savedUrl = await this.getUrlFromKV(timeId)
          if (savedUrl) {
            timeOption.savedUrl = savedUrl
            this.saveTimeData()
            if (confirm(`确定要跳转到 ${timeId} 对应的链接吗？`)) {
              window.open(savedUrl, '_blank')
            }
          }
        } catch (error) {
          console.error('获取保存的URL失败:', error)
        }
      }
    },
    
    triggerFileUpload(timeId) {
      const fileInput = document.getElementById('file-' + timeId)
      fileInput.click()
    },
    
    async handleFileUpload(event, timeId) {
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
      
      try {
        // 使用FileReader读取文件
        const reader = new FileReader()
        reader.onload = async (e) => {
          try {
            // 解析二维码
            const qrCodeUrl = await this.parseQRCode(e.target.result)
            if (qrCodeUrl) {
              console.log('🅰️ 二维码地址 (A):', qrCodeUrl)
              
              // 显示二维码解析结果
              console.log('🅰️ 二维码地址:', qrCodeUrl)
              
              // 调用后端API获取最终地址
              try {
                // const response = await fetch(`https://mf.ppis.me/api/track-redirect?url=${encodeURIComponent(qrCodeUrl)}`)
                const response = await fetch(`https://mf.ppis.me/api/track-redirect?url=${encodeURIComponent(qrCodeUrl)}`)
                if (response.ok) {
                  const data = await response.json()
                  const finalUrl = data.finalUrl
                  console.log('🅱️ 最终地址:', finalUrl)
                  alert(`二维码解析成功！\n\n🅰️ 二维码地址:\n${qrCodeUrl}\n\n🅱️ 最终地址:\n${finalUrl}`)
                } else {
                  console.error('获取最终地址失败:', response.status)
                  alert(`二维码解析成功！\n\n二维码地址:\n${qrCodeUrl}\n\n⚠️ 无法获取最终地址`)
                }
              } catch (error) {
                console.error('调用API失败:', error)
                alert(`二维码解析成功！\n\n二维码地址:\n${qrCodeUrl}\n\n⚠️ 网络错误，无法获取最终地址`)
              }
            } else {
              alert('无法解析二维码，请确保图片包含有效的二维码')
            }
          } catch (error) {
            console.error('处理二维码失败:', error)
            alert('处理二维码失败: ' + error.message)
          }
          this.loading = false
        }
        
        reader.onerror = () => {
          alert('文件读取失败')
          this.loading = false
        }
        
        reader.readAsDataURL(file)
      } catch (error) {
        console.error('上传文件失败:', error)
        alert('上传文件失败: ' + error.message)
        this.loading = false
      }
      
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
    },
    
    // 解析二维码
    async parseQRCode(imageDataUrl) {
      try {
        // 动态导入 jsQR 库
        const jsQR = (await import('jsqr')).default;
        
        // 创建一个临时的 canvas 来处理图片
        const img = new Image()
        return new Promise((resolve, reject) => {
          img.onload = () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            
            // 设置合适的画布尺寸，如果图片太大则缩放
            let { width, height } = img
            const maxSize = 1000
            if (width > maxSize || height > maxSize) {
              const ratio = Math.min(maxSize / width, maxSize / height)
              width = width * ratio
              height = height * ratio
            }
            
            canvas.width = width
            canvas.height = height
            ctx.drawImage(img, 0, 0, width, height)
            
            // 获取图像数据
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            
            // 尝试多种解析方式
            const attempts = [
              // 1. 标准解析
              { inversionAttempts: "dontInvert" },
              // 2. 尝试反色
              { inversionAttempts: "onlyInvert" },
              // 3. 尝试所有可能
              { inversionAttempts: "attemptBoth" },
              // 4. 尝试不同的定位模式
              { inversionAttempts: "attemptBoth", locatePattern: true }
            ]
            
            for (const options of attempts) {
              try {
                const code = jsQR(imageData.data, imageData.width, imageData.height, options)
                if (code && code.data) {
                  console.log('二维码解析成功:', code.data)
                  resolve(code.data)
                  return
                }
              } catch (attemptError) {
                console.log('解析尝试失败:', attemptError)
                continue
              }
            }
            
            // 如果所有尝试都失败，尝试图像预处理
            try {
              const processedImageData = this.preprocessImage(ctx, canvas.width, canvas.height)
              for (const options of attempts) {
                const code = jsQR(processedImageData.data, processedImageData.width, processedImageData.height, options)
                if (code && code.data) {
                  console.log('预处理后二维码解析成功:', code.data)
                  resolve(code.data)
                  return
                }
              }
            } catch (preprocessError) {
              console.log('图像预处理失败:', preprocessError)
            }
            
            reject(new Error('未能识别二维码。请尝试：\n1. 确保图片清晰\n2. 二维码占据图片主要区域\n3. 避免反光或阴影\n4. 尝试不同角度拍摄'))
          }
          img.onerror = () => reject(new Error('图片加载失败'))
          img.src = imageDataUrl
        })
      } catch (error) {
        console.error('解析二维码失败:', error)
        throw error
      }
    },
    
    // 图像预处理
    preprocessImage(ctx, width, height) {
      // 获取原始图像数据
      const imageData = ctx.getImageData(0, 0, width, height)
      const data = imageData.data
      
      // 转换为灰度并增强对比度
      for (let i = 0; i < data.length; i += 4) {
        // 计算灰度值
        const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
        
        // 增强对比度（简单的阈值处理）
        const enhanced = gray > 128 ? 255 : 0
        
        data[i] = enhanced     // R
        data[i + 1] = enhanced // G
        data[i + 2] = enhanced // B
        // Alpha 通道保持不变
      }
      
      return imageData
    },
    

    
    // 修改URL参数
    modifyUrlParameters(url, timeId) {
      try {
        const urlObj = new URL(url)
        
        // 根据时间ID添加或修改参数
        urlObj.searchParams.set('time_period', timeId)
        urlObj.searchParams.set('source', 'hongqingting')
        
        // 设置timestamp为当前时间加一年（365天 * 24小时 * 60分钟 * 60秒 * 1000毫秒）
        const oneYearInMs = 365 * 24 * 60 * 60 * 1000
        const timestampPlusOneYear = Date.now() + oneYearInMs
        urlObj.searchParams.set('timestamp', timestampPlusOneYear)
        
        // 可以根据需要添加更多参数修改逻辑
        switch (timeId) {
          case '2h':
            urlObj.searchParams.set('duration', '2')
            break
          case '4h':
            urlObj.searchParams.set('duration', '4')
            break
          case '6h':
            urlObj.searchParams.set('duration', '6')
            break
        }
        
        return urlObj.toString()
      } catch (error) {
        console.error('修改URL参数失败:', error)
        return url
      }
    },
    
    // 保存URL到KV
    async saveUrlToKV(timeId, url) {
      try {
        const response = await fetch('/api/save-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            timeId: timeId,
            url: url,
            timestamp: new Date().toISOString()
          })
        })
        
        if (!response.ok) {
          throw new Error('保存到KV失败')
        }
        
        const result = await response.json()
        console.log('URL已保存到KV:', result)
        return result
      } catch (error) {
        console.error('保存URL到KV失败:', error)
        // 降级到本地存储
        localStorage.setItem(`hongqingting_url_${timeId}`, url)
        throw error
      }
    },
    
    // 从KV读取存储的真实地址数据
    async loadRealUrlsFromKV() {
      console.log('🔄 开始从KV读取真实地址数据...')
      
      try {
        // 调用新的API获取所有时间段的真实地址数据
        const response = await fetch('/api/get-real-urls')
        
        if (response.ok) {
          const result = await response.json()
          
          if (result.success && result.data) {
            // 遍历每个时间段的数据
            for (const timeOption of this.timeOptions) {
              const realUrlData = result.data[timeOption.id]
              
              if (realUrlData && realUrlData.finalUrl) {
                console.log(`📍 找到 ${timeOption.id} 的真实地址:`, realUrlData.finalUrl)
                console.log(`   原始地址: ${realUrlData.originalUrl}`)
                console.log(`   重定向次数: ${realUrlData.redirectCount}`)
                console.log(`   存储时间: ${realUrlData.timestamp}`)
                console.log(`   过期时间: ${realUrlData.expireTime}`)
                
                // 如果当前没有保存的URL，则使用从KV读取的真实地址
                if (!timeOption.savedUrl) {
                  timeOption.savedUrl = realUrlData.finalUrl
                  timeOption.lastUpdate = realUrlData.timestamp
                }
                
                // 在时间按钮上显示真实地址信息
                timeOption.realUrlInfo = {
                  originalUrl: realUrlData.originalUrl,
                  finalUrl: realUrlData.finalUrl,
                  redirectCount: realUrlData.redirectCount,
                  timestamp: realUrlData.timestamp,
                  expireTime: realUrlData.expireTime
                }
              } else {
                console.log(`⚠️ ${timeOption.id} 时间段暂无真实地址数据`)
              }
            }
          }
        } else {
          console.warn('获取真实地址数据API响应失败:', response.status)
        }
      } catch (error) {
        console.error('读取真实地址数据失败:', error)
      }
      
      console.log('✅ KV真实地址数据读取完成')
    },
    
    // 从KV获取URL
    async getUrlFromKV(timeId) {
      try {
        const response = await fetch(`/api/get-url?timeId=${timeId}`)
        
        if (response.ok) {
          const data = await response.json()
          return data.url
        } else {
          // 降级到本地存储
          return localStorage.getItem(`hongqingting_url_${timeId}`)
        }
      } catch (error) {
        console.error('从KV获取URL失败:', error)
        // 降级到本地存储
        return localStorage.getItem(`hongqingting_url_${timeId}`)
      }
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

.time-btn.has-url {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.time-btn.has-url.active {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 6px 16px rgba(245, 87, 108, 0.4);
}

.url-indicator {
  margin-left: 0.5rem;
  font-size: 1rem;
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

/* 真实地址信息显示 */
.real-url-info {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 12px;
  border: 1px solid #0ea5e9;
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.1);
}

.real-url-title {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #0c4a6e;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.real-url-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.url-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.url-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
}

.url-link {
  color: #0ea5e9;
  text-decoration: none;
  word-break: break-all;
  padding: 0.5rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.url-link:hover {
  background: #f8fafc;
  border-color: #0ea5e9;
  transform: translateY(-1px);
}

.url-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;
}

.meta-item {
  font-size: 0.85rem;
  color: #6b7280;
  background: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
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
  
  .real-url-info {
    padding: 1rem;
  }
  
  .url-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .meta-item {
    text-align: center;
  }
}
</style>