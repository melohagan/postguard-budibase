import createDebugLogger from "debug"
import { ColumnDescriptor } from "squid"
import { getAllSubqueries } from "./utils"
import { ColumnReference, SourceFile } from "./types"
import { loadSourceFile, parseSourceFile as parseSourceFileUsingBabel } from "./babel/parse-file"

export { loadSourceFile }

const debugFile = createDebugLogger("postguard:file")
const debugQueries = createDebugLogger("postguard:query")
const debugSubqueries = createDebugLogger("postguard:subquery")
const debugTables = createDebugLogger("postguard:table")

function formatColumnRefs(columnRefs: ColumnReference[]): string {
  const formattedColumnRefs = columnRefs.map(col =>
    "tableName" in col ? `${col.tableName}.${col.columnName}` : col.columnName
  )
  return formattedColumnRefs.length > 0 ? formattedColumnRefs.join(", ") : "-"
}

function stringifyColumnType(descriptor: ColumnDescriptor) {
  const props: string[] = [
    descriptor.hasDefault ? "default value" : null,
    descriptor.nullable ? "nullable" : null
  ].filter(str => !!str) as string[]

  const propsString = props.length > 0 ? ` (${props.join(", ")})` : ""

  if (descriptor.type === "enum" && descriptor.enum) {
    return `enum${propsString} [${descriptor.enum.map(value => `'${value}'`).join(", ")}]`
  } else {
    return `${descriptor.type}${
      descriptor.subtype ? `[${descriptor.subtype.type}]` : ""
    }${propsString}`
  }
}

export function parseSourceFile(sourceFile: SourceFile) {
  debugFile(`Start parsing file ${sourceFile.filePath}`)
  const { queries, tableSchemas } = parseSourceFileUsingBabel(sourceFile)

  debugFile(`Parsed file ${sourceFile.filePath}:`)

  for (const table of tableSchemas) {
    debugTables(`  Table: ${table.tableName}`)
    for (const columnName of table.columnNames) {
      const columnType = stringifyColumnType(table.columnDescriptors[columnName])
      debugTables(`    Column "${columnName}": ${columnType}`)
    }
  }

  return { queries, tableSchemas }
}
