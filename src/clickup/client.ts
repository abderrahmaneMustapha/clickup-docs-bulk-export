import axios, { AxiosInstance, AxiosError } from 'axios'
import type { ClickUpWorkspace, ClickUpDoc } from './types.js'

export class ClickUpClient {
  private api: AxiosInstance
  private rateLimitDelay: number = 100 // ms between requests

  constructor(accessToken: string) {
    this.api = axios.create({
      baseURL: 'https://api.clickup.com/api/v3',
      headers: {
        Authorization: accessToken,
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
    })

    // Add request interceptor for rate limiting
    this.api.interceptors.request.use(async (config) => {
      await this.delay(this.rateLimitDelay)
      return config
    })
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private async handleRequest<T>(request: () => Promise<T>): Promise<T> {
    let attempt = 0
    const maxServerRetries = 3
    
    while (true) {
      try {
        return await request()
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError<{ err: string; ECODE: string; error?: string }>
          const status = axiosError.response?.status
          
          // Rate limited (429) - always retry with exponential backoff
          if (status === 429) {
            attempt++
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 60000)
            await this.delay(delay)
            continue
          }
          
          // Server errors (5xx) - retry up to 3 times
          if (status && status >= 500 && attempt < maxServerRetries) {
            attempt++
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000)
            await this.delay(delay)
            continue
          }
          
          const errorMessage = 
            axiosError.response?.data?.err || 
            axiosError.response?.data?.error ||
            axiosError.message ||
            'ClickUp API error'
          throw new Error(errorMessage)
        }
        throw error
      }
    }
  }

  /**
   * Safe GET request with rate limit handling
   */
  async safeGet<T>(url: string, config?: any): Promise<T> {
    return this.handleRequest(async () => {
      const response = await this.api.get<T>(url, config)
      return response.data
    })
  }

  async getWorkspaces(): Promise<ClickUpWorkspace[]> {
    return this.handleRequest(async () => {
      try {
        const response = await this.api.get<{ workspaces: ClickUpWorkspace[] }>('/workspaces')
        return response.data.workspaces || []
      } catch (error) {
        // Fallback to v2 endpoint
        const v2Api = axios.create({
          baseURL: 'https://api.clickup.com/api/v2',
          headers: this.api.defaults.headers as Record<string, string>,
        })
        const response = await v2Api.get<{ teams: ClickUpWorkspace[] }>('/team')
        return response.data.teams
      }
    })
  }

  async getDocs(workspaceId: string): Promise<ClickUpDoc[]> {
    return this.handleRequest(async () => {
      const params = {
        deleted: false,
        archived: false,
        limit: 100,
      }
      
      const response = await this.api.get<{ docs: ClickUpDoc[] }>(
        `/workspaces/${workspaceId}/docs`,
        { params }
      )
      return response.data.docs || []
    })
  }

  async getDoc(workspaceId: string, docId: string): Promise<ClickUpDoc> {
    return this.handleRequest(async () => {
      const response = await this.api.get<any>(
        `/workspaces/${workspaceId}/docs/${docId}`
      )
      return response.data.doc || response.data
    })
  }

  async getPageListing(workspaceId: string, docId: string): Promise<any[]> {
    return this.handleRequest(async () => {
      const response = await this.safeGet<any>(
        `/workspaces/${workspaceId}/docs/${docId}/page_listing`,
        {
          params: {
            max_page_depth: -1, // Unlimited depth
          },
        }
      )
      
      if (Array.isArray(response)) {
        return response
      } else if (response?.pages) {
        return response.pages
      } else if (response?.children) {
        return response.children
      }
      return []
    })
  }

  async getPageContent(workspaceId: string, docId: string, pageId: string): Promise<any> {
    return this.handleRequest(async () => {
      const response = await this.api.get<any>(
        `/workspaces/${workspaceId}/docs/${docId}/pages/${pageId}`,
        {
          params: {
            content_format: 'text/md',
          },
        }
      )
      return response.data
    })
  }
}
