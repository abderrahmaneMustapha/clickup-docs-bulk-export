#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { ClickUpExporter } from './exporter.js'
import type { ExportOptions } from './clickup/types.js'

const program = new Command()

program
  .name('clickup-docs-exporter')
  .description('Export ClickUp Docs and Wikis to markdown files')
  .version('1.0.0')

program
  .requiredOption('-t, --token <token>', 'ClickUp API token (pk_xxx or personal token)')
  .requiredOption('-w, --workspace <id>', 'ClickUp Workspace ID')
  .option('-o, --output <dir>', 'Output directory', './clickup-docs')
  .option('-d, --doc <id>', 'Export single doc by ID (optional)')
  .option('-v, --verbose', 'Verbose output', false)
  .action(async (opts) => {
    console.log()
    console.log(chalk.bold.cyan('📚 ClickUp Docs Exporter'))
    console.log(chalk.gray('─'.repeat(40)))
    console.log()

    const options: ExportOptions = {
      token: opts.token,
      workspaceId: opts.workspace,
      outputDir: opts.output,
      docId: opts.doc,
      verbose: opts.verbose,
    }

    // Mask token for display
    const maskedToken = options.token.length > 12
      ? `${options.token.slice(0, 6)}...${options.token.slice(-4)}`
      : '***'

    console.log(chalk.gray('  Token:'), maskedToken)
    console.log(chalk.gray('  Workspace:'), options.workspaceId)
    console.log(chalk.gray('  Output:'), options.outputDir)
    if (options.docId) {
      console.log(chalk.gray('  Doc ID:'), options.docId)
    }
    console.log()

    const spinner = ora('Starting export...').start()

    try {
      const exporter = new ClickUpExporter(options)
      
      spinner.text = 'Connecting to ClickUp...'
      const result = await exporter.export()

      spinner.succeed('Export complete!')
      console.log()
      console.log(chalk.bold.green('✨ Export Summary'))
      console.log(chalk.gray('─'.repeat(40)))
      console.log(chalk.gray('  Docs exported:'), chalk.white(result.totalDocs))
      console.log(chalk.gray('  Pages exported:'), chalk.white(result.totalPages))
      console.log(chalk.gray('  Output directory:'), chalk.white(result.outputDir))
      
      if (result.errors.length > 0) {
        console.log()
        console.log(chalk.yellow(`  ⚠ ${result.errors.length} warning(s):`))
        result.errors.slice(0, 5).forEach(err => {
          console.log(chalk.gray(`    - ${err}`))
        })
        if (result.errors.length > 5) {
          console.log(chalk.gray(`    ... and ${result.errors.length - 5} more`))
        }
      }

      console.log()
      console.log(chalk.gray('Need a hosted solution? Check out'), chalk.cyan('https://wikibeem.com'))
      console.log()

    } catch (error: any) {
      spinner.fail('Export failed')
      console.error()
      console.error(chalk.red('Error:'), error.message)
      
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        console.error()
        console.error(chalk.yellow('Tip: Make sure your API token is valid.'))
        console.error(chalk.gray('Get your token at: https://app.clickup.com/settings/apps'))
      }
      
      process.exit(1)
    }
  })

program.parse()
