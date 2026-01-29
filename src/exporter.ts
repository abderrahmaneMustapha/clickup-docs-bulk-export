import * as fs from 'fs'
import * as path from 'path'
import { ClickUpClient } from './clickup/client.js'
import type { ClickUpDoc, ClickUpDocPage, ExportOptions, ExportResult } from './clickup/types.js'
import { sanitizeFilename } from './utils/sanitize.js'
import { Logger } from './utils/logger.js'

export class ClickUpExporter {
  private client: ClickUpClient
  private logger: Logger
  private options: ExportOptions
  private exportedPages: number = 0
  private errors: string[] = []
  private pageDelay: number

  constructor(options: ExportOptions) {
    this.options = options
    this.client = new ClickUpClient(options.token)
    this.logger = new Logger(options.verbose)
    this.pageDelay = options.pageDelay ?? 100 // Default 100ms delay between page fetches
  }

  /**
   * Delay helper to prevent API rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Main export function
   */
  async export(): Promise<ExportResult> {
    const { workspaceId, outputDir, docId } = this.options

    // Ensure output directory exists
    this.ensureDir(outputDir)

    // Verify workspace access
    this.logger.info('Verifying workspace access...')
    const workspaces = await this.client.getWorkspaces()
    
    const workspace = workspaces.find(w => w.id === workspaceId)
    if (!workspace && workspaces.length > 0) {
      this.logger.warn(`Workspace ${workspaceId} not found, using first available: ${workspaces[0].name}`)
    }

    let docs: ClickUpDoc[]

    if (docId) {
      // Export single doc
      this.logger.info(`Fetching doc ${docId}...`)
      const doc = await this.client.getDoc(workspaceId, docId)
      docs = [doc]
    } else {
      // Export all docs
      this.logger.info('Fetching all docs...')
      docs = await this.client.getDocs(workspaceId)
    }

    this.logger.success(`Found ${docs.length} doc(s) to export`)

    // Process each doc
    for (const doc of docs) {
      await this.exportDoc(doc, workspaceId, outputDir)
    }

    return {
      totalDocs: docs.length,
      totalPages: this.exportedPages,
      outputDir: path.resolve(outputDir),
      errors: this.errors,
    }
  }

  /**
   * Export a single doc with all its pages
   */
  private async exportDoc(doc: ClickUpDoc, workspaceId: string, outputDir: string): Promise<void> {
    const docName = doc.name || 'unnamed-doc'
    const docDir = path.join(outputDir, sanitizeFilename(docName))
    
    this.logger.info(`Exporting: ${docName}`)
    this.ensureDir(docDir)

    // Fetch page hierarchy
    this.logger.debug(`Fetching page hierarchy for ${doc.id}...`)
    let pages: any[] = []
    
    try {
      pages = await this.client.getPageListing(workspaceId, doc.id)
      this.logger.debug(`Found ${this.countPagesRecursively(pages)} pages`)
    } catch (error: any) {
      this.logger.warn(`Could not fetch pages: ${error.message}`)
    }

    if (pages.length === 0) {
      // Doc has no pages, create a single index.md
      const content = this.generateDocContent(doc)
      this.writeMarkdownFile(path.join(docDir, 'index.md'), docName, content)
      this.exportedPages++
      return
    }

    // Fetch content and export each page
    await this.exportPages(pages, workspaceId, doc.id, docDir)
  }

  /**
   * Recursively export pages to folder structure
   */
  private async exportPages(
    pages: any[],
    workspaceId: string,
    docId: string,
    parentDir: string
  ): Promise<void> {
    for (const page of pages) {
      if (!page || !page.id) continue

      const pageName = page.name || 'unnamed-page'
      const children = page.children || page.sub_pages || page.pages || []
      const hasChildren = children.length > 0

      // Fetch page content
      let content = ''
      try {
        const pageData = await this.client.getPageContent(workspaceId, docId, page.id)
        content = pageData?.content || pageData?.body || pageData?.markdown || ''
      } catch (error: any) {
        this.logger.debug(`Could not fetch content for "${pageName}": ${error.message}`)
        this.errors.push(`Failed to fetch content for "${pageName}"`)
      }

      // Rate limit delay to prevent API throttling on large docs
      await this.delay(this.pageDelay)

      if (hasChildren) {
        // Page has children: create folder with index.md
        const pageDir = path.join(parentDir, sanitizeFilename(pageName))
        this.ensureDir(pageDir)
        this.writeMarkdownFile(path.join(pageDir, 'index.md'), pageName, content)
        this.exportedPages++
        
        // Recursively export children
        await this.exportPages(children, workspaceId, docId, pageDir)
      } else {
        // Leaf page: create single .md file
        const filename = sanitizeFilename(pageName) + '.md'
        this.writeMarkdownFile(path.join(parentDir, filename), pageName, content)
        this.exportedPages++
      }

      this.logger.debug(`Exported: ${pageName}`)
    }
  }

  /**
   * Generate content for a doc without pages
   */
  private generateDocContent(doc: ClickUpDoc): string {
    if (doc.content && Array.isArray(doc.content)) {
      return doc.content
        .filter(item => item.type === 'markdown' || typeof item.content === 'string')
        .map(item => item.content || '')
        .join('\n\n')
    }
    return ''
  }

  /**
   * Write a markdown file with frontmatter
   */
  private writeMarkdownFile(filepath: string, title: string, content: string): void {
    const frontmatter = `---
title: "${title.replace(/"/g, '\\"')}"
exported_at: "${new Date().toISOString()}"
---

`
    const finalContent = frontmatter + (content || '*No content*')
    fs.writeFileSync(filepath, finalContent, 'utf-8')
  }

  /**
   * Count total pages recursively
   */
  private countPagesRecursively(pages: any[]): number {
    let count = 0
    for (const page of pages) {
      count++
      const children = page.children || page.sub_pages || page.pages || []
      if (children.length > 0) {
        count += this.countPagesRecursively(children)
      }
    }
    return count
  }

  /**
   * Ensure directory exists
   */
  private ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }
}
