import chalk from 'chalk'

export class Logger {
  private verbose: boolean

  constructor(verbose: boolean = false) {
    this.verbose = verbose
  }

  info(message: string): void {
    console.log(chalk.blue('ℹ'), message)
  }

  success(message: string): void {
    console.log(chalk.green('✓'), message)
  }

  warn(message: string): void {
    console.log(chalk.yellow('⚠'), message)
  }

  error(message: string): void {
    console.error(chalk.red('✗'), message)
  }

  debug(message: string): void {
    if (this.verbose) {
      console.log(chalk.gray('  →'), chalk.gray(message))
    }
  }

  blank(): void {
    console.log()
  }

  header(message: string): void {
    console.log()
    console.log(chalk.bold.cyan(message))
    console.log(chalk.gray('─'.repeat(50)))
  }

  stats(label: string, value: string | number): void {
    console.log(chalk.gray(`  ${label}:`), chalk.white(value))
  }
}

export const logger = new Logger()
