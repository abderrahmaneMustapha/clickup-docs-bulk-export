export interface ClickUpWorkspace {
  id: string
  name: string
  color?: string
  avatar?: string
}

export interface ClickUpDoc {
  id: string
  name: string
  type?: 'doc' | 'wiki' | number
  date_created?: string | number
  date_updated?: string | number
  creator?: {
    id: string
    username: string
    email: string
  } | number
  content?: ClickUpDocContent[]
  children?: ClickUpDoc[]
  parent?: {
    id: string
    type?: number
  }
  pages?: ClickUpDocPage[]
  workspace_id?: number
  public?: boolean
  archived?: boolean
  deleted?: boolean
}

export interface ClickUpDocPage {
  id: string
  name?: string
  date_created?: string | number
  date_updated?: string | number
  content?: string | ClickUpDocContent[]
  body?: string
  markdown?: string
  order?: number
  children?: ClickUpDocPage[]
  sub_pages?: ClickUpDocPage[]
  pages?: ClickUpDocPage[]
}

export interface ClickUpDocContent {
  type: string
  content?: any
  attrs?: any
  pageId?: string
  pageName?: string
}

export interface ExportOptions {
  token: string
  workspaceId: string
  outputDir: string
  docId?: string
  verbose?: boolean
}

export interface ExportResult {
  totalDocs: number
  totalPages: number
  outputDir: string
  errors: string[]
}
