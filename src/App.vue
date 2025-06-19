<template>
  <div id="app">
    <header class="header">
      <div class="container">
        <h1 class="logo">🌸 红蜻蜓</h1>
        <nav class="nav">
          <a href="#home" class="nav-link">首页</a>
          <a href="#about" class="nav-link">关于</a>
          <a href="#contact" class="nav-link">联系</a>
        </nav>
      </div>
    </header>

    <main class="main">
      <section class="hero">
        <div class="container">
          <h2 class="hero-title">欢迎来到红蜻蜓</h2>
          <p class="hero-subtitle">基于 Vue.js 构建，部署在 Cloudflare Pages</p>
          <div class="hero-buttons">
            <button class="btn btn-primary" @click="showMessage">开始探索</button>
            <button class="btn btn-secondary" @click="learnMore">了解更多</button>
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
  methods: {
    showMessage() {
      alert('欢迎使用红蜻蜓应用！🎉')
    },
    learnMore() {
      window.open('https://developers.cloudflare.com/pages/', '_blank')
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
}
</style>