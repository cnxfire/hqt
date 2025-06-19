package hqt

import (
	"fmt"
	"net/http"
	"net/url"
	"time"

	"github.com/gin-gonic/gin"
)

// URLTracker 用于追踪URL重定向的结构体
type URLTracker struct {
	client *http.Client
}

// NewURLTracker 创建一个新的URL追踪器
func NewURLTracker() *URLTracker {
	// 创建自定义的HTTP客户端，不自动跟随重定向
	client := &http.Client{
		Timeout: 30 * time.Second,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			// 不自动跟随重定向，我们手动处理
			return http.ErrUseLastResponse
		},
	}

	return &URLTracker{
		client: client,
	}
}

// GetFinalURL 根据给定的URL获取最终的重定向地址
func (ut *URLTracker) GetFinalURL(initialURL string) (string, error) {
	currentURL := initialURL
	redirectCount := 0
	maxRedirects := 10 // 防止无限重定向

	for redirectCount < maxRedirects {
		// 发送HEAD请求以获取重定向信息（更高效）
		resp, err := ut.client.Head(currentURL)
		if err != nil {
			// 如果HEAD请求失败，尝试GET请求
			resp, err = ut.client.Get(currentURL)
			if err != nil {
				return "", fmt.Errorf("请求失败: %v", err)
			}
		}
		defer resp.Body.Close()

		// 检查是否是重定向状态码
		if resp.StatusCode >= 300 && resp.StatusCode < 400 {
			location := resp.Header.Get("Location")
			if location == "" {
				return currentURL, nil // 没有Location头，返回当前URL
			}

			// 处理相对URL
			baseURL, err := url.Parse(currentURL)
			if err != nil {
				return "", fmt.Errorf("解析URL失败: %v", err)
			}

			locationURL, err := url.Parse(location)
			if err != nil {
				return "", fmt.Errorf("解析重定向URL失败: %v", err)
			}

			// 解析绝对URL
			finalURL := baseURL.ResolveReference(locationURL)
			currentURL = finalURL.String()
			redirectCount++

			fmt.Printf("重定向 %d: %s\n", redirectCount, currentURL)
		} else {
			// 非重定向状态码，返回当前URL
			return currentURL, nil
		}
	}

	if redirectCount >= maxRedirects {
		return "", fmt.Errorf("重定向次数过多，可能存在循环重定向")
	}

	return currentURL, nil
}

// GetFinalURLWithDetails 获取最终URL并返回详细的重定向信息
func (ut *URLTracker) GetFinalURLWithDetails(initialURL string) (map[string]interface{}, error) {
	currentURL := initialURL
	redirectCount := 0
	maxRedirects := 10
	redirectChain := []string{initialURL}

	for redirectCount < maxRedirects {
		resp, err := ut.client.Head(currentURL)
		if err != nil {
			resp, err = ut.client.Get(currentURL)
			if err != nil {
				return nil, fmt.Errorf("请求失败: %v", err)
			}
		}
		defer resp.Body.Close()

		if resp.StatusCode >= 300 && resp.StatusCode < 400 {
			location := resp.Header.Get("Location")
			if location == "" {
				break
			}

			baseURL, err := url.Parse(currentURL)
			if err != nil {
				return nil, fmt.Errorf("解析URL失败: %v", err)
			}

			locationURL, err := url.Parse(location)
			if err != nil {
				return nil, fmt.Errorf("解析重定向URL失败: %v", err)
			}

			finalURL := baseURL.ResolveReference(locationURL)
			currentURL = finalURL.String()
			redirectCount++
			redirectChain = append(redirectChain, currentURL)
		} else {
			break
		}
	}

	if redirectCount >= maxRedirects {
		return nil, fmt.Errorf("重定向次数过多，可能存在循环重定向")
	}

	return map[string]interface{}{
		"originalUrl":   initialURL,
		"finalUrl":      currentURL,
		"redirectCount": redirectCount,
		"redirectChain": redirectChain,
	}, nil
}

// TrackRedirectHandler 处理URL重定向追踪的API接口
func TrackRedirectHandler(c *gin.Context) {
	// 从GET参数获取URL
	targetURL := c.Query("url")
	if targetURL == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "缺少url参数",
			"message": "请在查询参数中提供url",
		})
		return
	}

	// 创建URL追踪器
	tracker := NewURLTracker()

	// 获取详细的重定向信息
	details, err := tracker.GetFinalURLWithDetails(targetURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":       "追踪URL失败",
			"message":     err.Error(),
			"originalUrl": targetURL,
		})
		return
	}

	// 返回成功结果
	c.JSON(http.StatusOK, gin.H{
		"success":       true,
		"originalUrl":   details["originalUrl"],
		"finalUrl":      details["finalUrl"],
		"redirectCount": details["redirectCount"],
		"redirectChain": details["redirectChain"],
	})
}

// 设置CORS中间件
func CORSMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Header("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})import (
    "encoding/json"
    "strconv"
    "strings"
    // ... 其他导入
)

// 添加一个函数来处理Unicode转义
func unescapeUnicode(s string) string {
    // 处理\u0026这样的Unicode转义序列
    result := s
    for strings.Contains(result, "\\u") {
        var unquoted string
        var err error
        // 使用strconv.Unquote来处理Unicode转义
        quoted := `"` + result + `"`
        unquoted, err = strconv.Unquote(quoted)
        if err != nil {
            break
        }
        result = unquoted
    }
    return result
}

// 修改TrackRedirectHandler函数
func TrackRedirectHandler(c *gin.Context) {
    targetURL := c.Query("url")
    if targetURL == "" {
        c.JSON(http.StatusBadRequest, gin.H{
            "error":   "缺少url参数",
            "message": "请在查询参数中提供url",
        })
        return
    }

    tracker := NewURLTracker()
    details, err := tracker.GetFinalURLWithDetails(targetURL)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error":       "追踪URL失败",
            "message":     err.Error(),
            "originalUrl": targetURL,
        })
        return
    }

    // 处理最终URL中的Unicode转义序列
    finalURL := details["finalUrl"].(string)
    cleanFinalURL := unescapeUnicode(finalURL)

    c.JSON(http.StatusOK, gin.H{
        "success":       true,
        "originalUrl":   details["originalUrl"],
        "finalUrl":      cleanFinalURL,  // 使用清理后的URL
        "rawFinalUrl":   finalURL,       // 保留原始URL（可选）
        "redirectCount": details["redirectCount"],
        "redirectChain": details["redirectChain"],
    })
}
}
